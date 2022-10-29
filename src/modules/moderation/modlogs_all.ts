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
        t(this, 'ERROR_MISSING_PERMISSIONS').replace('<PERMISSIONS>', 'Manage Server')
      );
    }

    await this.reply(await renderModlogs.call(this));
  },
});

export function renderStrike(
  strike: moderationStrikes,
  locale: string,
  strikes: moderationStrikes[]
) {
  const action = t(
    locale,
    strike.type === 'CLEAR' ? 'MODERATION_LOGS_CLEAR' : `MODERATION_LOGS_ACTION_${strike.type}`
  );
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
              name: t(this, 'MODERATION_LOGS_VIEW_TITLE').replace('<SERVER>', this.guild.name),
              iconURL: this.guild.iconURL(),
            },
        description: !data || data.length === 0 ? '*No moderation history found.*' : '',
        fields: results.map((strike) => renderStrike(strike, this.guildLocale, data)),
        footer: {
          text: `${data.length} entries total • Page ${page + 1}/${pages}`,
        },
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(
        new StrikeSelectMenu().setPlaceholder('View, edit or delete a strike').setOptions(
          results.map((s, i) => ({
            label: `Strike #${data.indexOf(s) + 1}`,
            description: `${dayjs(s.createdAt).format('YYYY-MM-DD')} • ${t(
              this.guildLocale,
              s.type === 'CLEAR' ? 'MODERATION_LOGS_CLEAR' : `MODERATION_LOGS_ACTION_${s.type}`
            )}`,
            value: s.id,
          }))
        )
      ),
      row(
        // new ShowFiltersBtn().setStyle('SECONDARY').setLabel('Show Filters'),
        new GoToPage({ page: 0, userId: user?.id, s: false })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_first)
          .setDisabled(page === 0),
        new GoToPage({ page: page - 1, userId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.left_arrow)
          .setDisabled(page === 0),
        new GoToPage({ page: page + 1, userId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.right_arrow)
          .setDisabled(page === pages - 1),
        new GoToPage({ page: pages - 1, userId: user?.id, s: true })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_last)
          .setDisabled(page === pages - 1)
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
  async handle(ctx: null) {
    return this.update(await renderStrikePage.call(this, this.values[0]));
  },
});

async function renderStrikePage(
  this: SelectMenuInteraction | ModalSubmitInteraction,
  strikeId: string
) {
  const strikes = await fetchWithCache(
    `strikes:${this.guildId}`,
    () =>
      prisma.moderationStrikes.findMany({
        where: { serverId: this.guild.id },
      }),
    this instanceof ModalSubmitInteraction
  );

  const strike = strikes.find(({ id }) => id === strikeId);

  return {
    embeds: [
      {
        author: {
          name: t(this, 'MODERATION_LOGS_VIEW_TITLE').replace('<SERVER>', this.guild.name),
          icon_url: this.guild.iconURL(),
        },
        title: `Strike #${strikes.indexOf(strike) + 1} • ${t(
          this.guildLocale,
          strike.type === 'CLEAR'
            ? 'MODERATION_LOGS_CLEAR'
            : `MODERATION_LOGS_ACTION_${strike.type}`
        )}`,
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
        new GoToPage({ page: 0 })
          .setEmoji(emojis.buttons.left_arrow)
          .setLabel('Back')
          .setStyle('SECONDARY'),
        new EditButton({ strikeId, index: strikes.indexOf(strike) + 1 })
          .setEmoji(emojis.buttons.pencil)
          .setLabel('Edit Reason')
          .setStyle('PRIMARY'),
        new DeleteButton(strikeId)
          .setEmoji(emojis.buttons.trash_bin)
          .setLabel('Delete Strike')
          .setStyle('DANGER')
      )
    ),
  };
}

export const EditButton = ButtonComponent({
  async handle({ strikeId, index }) {
    const strike = (
      await fetchWithCache(`strikes:${this.guildId}`, () =>
        prisma.moderationStrikes.findMany({
          where: { serverId: this.guild.id },
        })
      )
    ).find(({ id }) => id === strikeId);

    await this.showModal(
      new EditModal(strikeId).setTitle(`Edit Strike #${index}`).setComponents(
        row(
          new TextInputComponent()
            .setLabel('Reason')
            .setValue(strike.reason ?? '')
            .setCustomId('reason')
            .setMaxLength(100)
            .setStyle('PARAGRAPH')
            .setRequired(true)
        )
      )
    );
  },
});

export const EditModal = ModalComponent({
  async handle(strikeId: string) {
    const reason = this.fields.getTextInputValue('reason');

    await prisma.moderationStrikes.update({
      where: { id: strikeId },
      data: { reason },
    });

    await this.update(await renderStrikePage.call(this, strikeId));
  },
});

export const DeleteButton = ButtonComponent({
  async handle(strikeId: string) {
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
          new ConfirmDeleteButton(strikeId).setLabel('Yes').setStyle('DANGER'),
          new GoToPage({ page: 0 }).setLabel('Cancel').setStyle('SECONDARY')
        )
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle(strikeId: string) {
    await prisma.moderationStrikes.delete({ where: { id: strikeId } });

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
