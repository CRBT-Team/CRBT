import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
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
import { PageBtnProps } from '../info/achievements';
import { ModerationColors, ModerationStrikeVerbs } from './_base';

export default ChatCommand({
  name: 'modlogs all',
  description: 'View the moderation history for all users and channels in this server.',
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
  const reason = `**Reason:** ${strike.reason ?? '*None specified*'}`;
  const target = strike.type !== 'CLEAR' ? `<@${strike.targetId}>` : `<#${strike.targetId}>`;

  return {
    name: `${strikes.indexOf(strike) + 1}. ${timestampMention(
      strike.createdAt,
      'f'
    )} • ${action} ${expires}`,
    value: dedent`
    <@${strike.moderatorId}> ${ModerationStrikeVerbs[strike.type].toLowerCase()} ${target}
    ${reason}
    `,
  };
}

export async function renderModlogs(
  this: Interaction,
  page: number = 0,
  filters?: {
    userId?: string;
  }
) {
  const user = filters?.userId ? this.client.users.cache.get(filters?.userId) : null;

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
  ).filter((a) => (filters?.userId ? a.targetId === filters?.userId : a));

  const results = data
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(page * 5, page * 5 + 5);
  const pages = Math.ceil(data.length / 5);

  return {
    embeds: [
      {
        author: user
          ? {
              name: `${user.tag} - Moderation history in ${this.guild.name}`,
              iconURL: avatar(user),
            }
          : {
              name: t(this, 'MODERATION_LOGS_VIEW_TITLE').replace('{SERVER}', this.guild.name),
              iconURL: this.guild.iconURL(),
            },
        description: !data || data.length === 0 ? '*No moderation history found.*' : '',
        fields: results.map((strike) => renderStrike(strike, this.guildLocale, data)),
        footer: {
          text: `${data.length} entries total • Page ${page + 1}/${pages}`,
        },
        color: await getColor(user ?? this.guild),
      },
    ],
    components: components(
      row(
        new StrikeSelectMenu({ page, userId: filters.userId })
          .setPlaceholder('View, edit or delete a strike')
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
        new GoToPage({ page: 0, userId: user?.id, s: false })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_first)
          .setDisabled(page <= 0),
        new GoToPage({ page: page - 1, userId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.left_arrow)
          .setDisabled(page <= 0),
        new GoToPage({ page: page + 1, userId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.right_arrow)
          .setDisabled(page >= pages - 1),
        new GoToPage({ page: pages - 1, userId: user?.id, s: true })
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
  async handle({ page, userId }: PageBtnProps) {
    this.update(await renderModlogs.call(this, page, { userId }));
  },
});

export const StrikeSelectMenu = SelectMenuComponent({
  async handle({ page, userId }: PageBtnProps) {
    return this.update(await renderStrikePage.call(this, this.values[0], { page, userId }));
  },
});

async function renderStrikePage(
  this: SelectMenuInteraction | ModalSubmitInteraction,
  sId: string,
  { page, userId }: PageBtnProps
) {
  const strikes = await fetchWithCache(
    `strikes:${this.guildId}`,
    () =>
      prisma.moderationStrikes.findMany({
        where: { serverId: this.guild.id },
      }),
    this instanceof ModalSubmitInteraction
  );

  const strike: moderationStrikes = strikes.find(({ id }) => id === sId);

  return {
    embeds: [
      {
        author: {
          name: t(this, 'MODERATION_LOGS_VIEW_TITLE', {
            SERVER: this.guild.name,
          }),
          icon_url: this.guild.iconURL(),
        },
        title: `Strike #${strikes.indexOf(strike) + 1} • ${t(this.guildLocale, strike.type)}`,
        fields: [
          {
            name: 'Reason',
            value: strike.reason ?? '*No reason specified*',
          },
          {
            name: 'Moderator',
            value: `<@${strike.moderatorId}>`,
            inline: true,
          },
          ...(strike.type === 'CLEAR'
            ? [
                {
                  name: 'Channel',
                  value: `<#${strike.targetId}>`,
                  inline: true,
                },
              ]
            : [
                {
                  name: 'User',
                  value: `<@${strike.targetId}>`,
                  inline: true,
                },
              ]),
          ...(strike.expiresAt
            ? [
                {
                  name: 'Set to expire',
                  value: `${timestampMention(strike.expiresAt)} • ${timestampMention(
                    strike.expiresAt,
                    'R'
                  )}`,
                },
              ]
            : []),
        ],
        color: ModerationColors[strike.type],
      },
    ],
    components: components(
      row(
        new GoToPage({ page, userId })
          .setEmoji(emojis.buttons.left_arrow)
          .setLabel('Back')
          .setStyle('SECONDARY'),
        ...(hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)
          ? [
              new EditButton({ sId, i: strikes.indexOf(strike) + 1, page, userId })
                .setEmoji(emojis.buttons.pencil)
                .setLabel('Edit Reason')
                .setStyle('PRIMARY'),
              new DeleteButton({ sId, page, userId })
                .setEmoji(emojis.buttons.trash_bin)
                .setLabel('Delete Strike')
                .setStyle('DANGER'),
            ]
          : [])
      )
    ),
  };
}

export const EditButton = ButtonComponent({
  async handle({ sId, userId, i, page }: PageBtnProps & { sId: string; i: number }) {
    const strike = (
      await fetchWithCache(`strikes:${this.guildId}`, () =>
        prisma.moderationStrikes.findMany({
          where: { serverId: this.guild.id },
        })
      )
    ).find(({ id }) => id === sId);

    await this.showModal(
      new EditModal({ page, userId, sId }).setTitle(`Edit Strike #${i}`).setComponents(
        row(
          new TextInputComponent()
            .setLabel('Reason')
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
  async handle({ sId, userId, page }: PageBtnProps & { sId: string }) {
    const reason = this.fields.getTextInputValue('reason');

    await prisma.moderationStrikes.update({
      where: { id: sId },
      data: { reason },
    });

    await this.update(await renderStrikePage.call(this, sId, { userId, page }));
  },
});

export const DeleteButton = ButtonComponent({
  async handle({ sId, userId }: PageBtnProps & { sId: string }) {
    const embed = this.message.embeds[0];

    await this.update({
      embeds: [
        {
          ...embed,
          author: {
            name: 'Are you sure you want to delete this reminder?',
          },
        },
      ],
      components: components(
        row(
          new ConfirmDeleteButton(sId).setLabel('Yes').setStyle('DANGER'),
          new GoToPage({ page: 0, userId }).setLabel('Cancel').setStyle('SECONDARY')
        )
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle(sId: string) {
    await prisma.moderationStrikes.delete({ where: { id: sId } });

    const newData = await fetchWithCache(
      `strikes:${this.guildId}`,
      () =>
        prisma.moderationStrikes.findMany({
          where: { serverId: this.guild.id },
        }),
      true
    );

    await this.update(await renderModlogs.call(this));
  },
});
