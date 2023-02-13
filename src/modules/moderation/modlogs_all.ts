import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import { moderationStrikes } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import dedent from 'dedent';
import { MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import {
  ButtonInteraction,
  Interaction,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  row,
  SelectMenuComponent,
} from 'purplet';
import { ModerationColors } from './_base';

interface PageBtnProps {
  page: number;
  uId?: string;
  s?: boolean;
}

export default ChatCommand({
  name: 'modlogs all',
  description: "View the server's Moderation History.",
  allowInDMs: false,
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return CRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS').replace('{PERMISSIONS}', 'Manage Server')
      );
    }

    await this.deferReply();

    const res = await renderModlogs.call(this);

    await this.editReply(res);
  },
});

export function renderStrike(
  strike: moderationStrikes,
  locale: string,
  strikes: moderationStrikes[]
) {
  const action = t(locale, strike.type as any);
  const expires =
    Date.now() < (strike.expiresAt?.getTime() ?? 0)
      ? `(Expires ${timestampMention(strike.expiresAt, 'R')}) `
      : '';
  const reason = `**${t(locale, strike.type === 'REPORT' ? 'DESCRIPTION' : 'REASON')}:** ${
    strike.details ? '[Message from user]' : strike.reason ?? `*${t(locale, 'NONE')}*`
  }`;
  const target = strike.type !== 'CLEAR' ? `<@${strike.targetId}>` : `<#${strike.targetId}>`;

  return {
    name: `${strikes.indexOf(strike) + 1}. ${timestampMention(
      strike.createdAt,
      'f'
    )} • ${action} ${expires}`,
    value: dedent`
    <@${strike.moderatorId}> ${t(locale, `MOD_VERB_${strike.type}`).toLocaleLowerCase(
      locale
    )} ${target}
    ${reason}
    `,
  };
}

export async function renderModlogs(
  this: Interaction,
  page: number = 0,
  filters?: {
    uId?: string;
  }
) {
  const user = filters?.uId ? this.client.users.cache.get(filters?.uId) : null;

  const data = (
    await fetchWithCache(
      `strikes:${this.guildId}`,
      () =>
        prisma.moderationStrikes.findMany({
          where: { serverId: this.guild.id },
        }),
      !(
        this instanceof ButtonInteraction &&
        !this.component.label &&
        this.component.style === 'PRIMARY'
      )
    )
  ).filter((a) => (filters?.uId ? a.targetId === filters?.uId : a));

  const results = data
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(page * 5, page * 5 + 5);
  const pages = Math.ceil(data.length / 5);

  return {
    embeds: [
      {
        author: user
          ? {
              name: `${user.tag} - ${t(this, 'MODERATION_LOGS_VIEW_TITLE', {
                SERVER: this.guild.name,
              })}`,
              iconURL: avatar(user),
            }
          : {
              name: t(this, 'MODERATION_LOGS_VIEW_TITLE', {
                SERVER: this.guild.name,
              }),
              iconURL: this.guild.iconURL(),
            },
        description: !data || data.length === 0 ? t(this, 'MODERATION_LOGS_VIEW_EMPTY') : '',
        fields: results.map((strike) => renderStrike(strike, this.locale, data)),
        footer: {
          text: `${data.length} entries total • ${t(this, 'PAGINATION_PAGE_OUT_OF', {
            page: page + 1,
            pages,
          })}`,
        },
        color: await getColor(user ?? this.guild),
      },
    ],
    components: components(
      row(
        new StrikeSelectMenu({ page, uId: filters?.uId })
          .setPlaceholder(t(this, 'MODERATION_LOGS_VIEW_SELECT_MENU_PLACEHOLDER'))
          .setOptions(
            !data || data.length === 0
              ? [{ label: 'h', value: 'h' }]
              : results.map((s, i) => ({
                  label: `Strike #${data.indexOf(s) + 1}`,
                  description: `${dayjs(s.createdAt).format('YYYY-MM-DD')} • ${t(
                    this.guildLocale,
                    s.type
                  )}`,
                  value: s.id,
                }))
          )
          .setDisabled(data.length === 0)
      ),
      row(
        // new ShowFiltersBtn().setStyle('SECONDARY').setLabel('Show Filters'),
        new GoToPage({ page: 0, uId: user?.id, s: false })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_first)
          .setDisabled(page <= 0),
        new GoToPage({ page: page - 1, uId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.left_arrow)
          .setDisabled(page <= 0),
        new GoToPage({ page: page + 1, uId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.right_arrow)
          .setDisabled(page >= pages - 1),
        new GoToPage({ page: pages - 1, uId: user?.id, s: true })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_last)
          .setDisabled(page >= pages - 1)
      )
    ),
    flags:
      // this instanceof ContextMenuInteraction ?
      MessageFlags.Ephemeral,
    // : 0,
  };
}

export const GoToPage = ButtonComponent({
  async handle({ page, uId }: PageBtnProps) {
    this.update(await renderModlogs.call(this, page, { uId }));
  },
});

export const StrikeSelectMenu = SelectMenuComponent({
  async handle({ page, uId }: PageBtnProps) {
    return this.update(await renderStrikePage.call(this, this.values[0], { page, uId }));
  },
});

async function renderStrikePage(
  this: SelectMenuInteraction | ModalSubmitInteraction | ButtonInteraction,
  sId: string,
  { page, uId }: PageBtnProps
) {
  const strikes = (
    await fetchWithCache(
      `strikes:${this.guildId}`,
      () =>
        prisma.moderationStrikes.findMany({
          where: { serverId: this.guild.id },
        }),
      this instanceof ModalSubmitInteraction
    )
  )
    .filter((a) => (uId ? a.targetId === uId : a))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const strike: moderationStrikes = strikes.find(({ id }) => id === sId);
  const target = await this.client.users.fetch(strike.targetId);

  return {
    embeds: [
      {
        author: {
          name: t(this, 'MODERATION_LOGS_VIEW_TITLE', {
            SERVER: this.guild.name,
          }),
          icon_url: this.guild.iconURL(),
        },
        title: `Strike #${strikes.indexOf(strike) + 1} • ${t(this, strike.type)}`,
        fields: [
          {
            name: t(this, strike.type === 'REPORT' ? 'DESCRIPTION' : 'REASON'),
            value: strike.reason ?? `*${t(this, 'NONE')}*`,
          },
          {
            name: t(this, strike.type === 'REPORT' ? 'REPORTED_BY' : 'MODERATOR'),
            value: `<@${strike.moderatorId}>`,
            inline: true,
          },
          ...(strike.type === 'CLEAR'
            ? [
                {
                  name: t(this, 'CHANNEL'),
                  value: `<#${strike.targetId}>`,
                  inline: true,
                },
              ]
            : [
                {
                  name: t(this, 'USER'),
                  value: `<@${strike.targetId}>`,
                  inline: true,
                },
              ]),
          ...(strike.expiresAt
            ? [
                {
                  name: t(this, 'EXPIRES_AT'),
                  value: `${timestampMention(strike.expiresAt)} • ${timestampMention(
                    strike.expiresAt,
                    'R'
                  )}`,
                },
              ]
            : []),
        ],
        color:
          strike.type === 'REPORT' ? await getColor(this.guild) : ModerationColors[strike.type],
      },
      ...(strike.details
        ? renderLowBudgetMessage({
            details: JSON.parse(strike.details),
            channel: this.channel,
            guild: this.guild,
            author: target,
          })
        : []),
    ],
    components: components(
      row(
        new GoToPage({ page, uId }).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        ...(hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)
          ? [
              ...(strike.type === 'REPORT'
                ? []
                : [
                    new EditButton({ sId, i: strikes.indexOf(strike) + 1, page, uId })
                      .setEmoji(emojis.buttons.pencil)
                      .setLabel(t(this, 'EDIT'))
                      .setStyle('PRIMARY'),
                  ]),
              new DeleteButton({ sId, page, uId })
                .setEmoji(emojis.buttons.trash_bin)
                .setLabel(t(this, 'DELETE'))
                .setStyle('DANGER'),
            ]
          : [])
      )
    ),
  };
}

export const EditButton = ButtonComponent({
  async handle({ sId, uId, i, page }: PageBtnProps & { sId: string; i: number }) {
    const strike = (
      await fetchWithCache(`strikes:${this.guildId}`, () =>
        prisma.moderationStrikes.findMany({
          where: { serverId: this.guild.id },
        })
      )
    ).find(({ id }) => id === sId);

    await this.showModal(
      new EditModal({ page, uId, sId }).setTitle(`Edit Strike #${i}`).setComponents(
        row(
          new TextInputComponent()
            .setLabel(t(this, 'REASON'))
            .setValue(strike.reason ?? '')
            .setCustomId('reason')
            .setMaxLength(256)
            .setStyle('PARAGRAPH')
            .setRequired(true)
        )
      )
    );
  },
});

export const EditModal = ModalComponent({
  async handle({ sId, uId, page }: PageBtnProps & { sId: string }) {
    const reason = this.fields.getTextInputValue('reason');

    await prisma.moderationStrikes.update({
      where: { id: sId },
      data: { reason },
    });

    await this.update(await renderStrikePage.call(this, sId, { uId, page }));
  },
});

export const DeleteButton = ButtonComponent({
  async handle({ sId, uId, page }: PageBtnProps & { sId: string }) {
    const embed = this.message.embeds[0];

    await this.update({
      embeds: [
        {
          ...embed,
          author: {
            name: t(this, 'DELETE_CONFIRMATION_TITLE'),
          },
        },
      ],
      components: components(
        row(
          new ConfirmDeleteButton({ uId, sId, page })
            .setLabel(t(this, 'CONFIRM'))
            .setStyle('DANGER'),
          new GoToPage({ page: 0, uId }).setLabel(t(this, 'CANCEL')).setStyle('SECONDARY')
        )
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle({ sId, uId, page }: PageBtnProps & { sId: string }) {
    await prisma.moderationStrikes.delete({ where: { id: sId } });

    await fetchWithCache(
      `strikes:${this.guildId}`,
      () =>
        prisma.moderationStrikes.findMany({
          where: { serverId: this.guild.id },
        }),
      true
    );

    await this.update(await renderModlogs.call(this, page, { uId }));
  },
});
