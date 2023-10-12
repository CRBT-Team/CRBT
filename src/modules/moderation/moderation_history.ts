import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { avatar } from '$lib/functions/avatar';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import {
  ModerationStrikeTypes,
  ModerationEntry as NewModerationEntry,
  OldModerationStrikes,
} from '@prisma/client';
import { dateToSnowflake, snowflakeToDate, timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import { MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import {
  ButtonInteraction,
  Interaction,
  MessageOptions,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  ModalComponent,
  OptionBuilder,
  SelectMenuComponent,
  components,
  row,
} from 'purplet';
import {
  ChannelModerationActions,
  ModerationAction,
  ModerationColors,
  moderationVerbStrings,
} from './_base';

export type ModerationEntry = NewModerationEntry & { oldId?: string };

export type ModerationHistoryFilters = {
  targetId?: string;
};

async function getAllEntries(this: Interaction, filters?: ModerationHistoryFilters) {
  const oldData = (
    await fetchWithCache(
      `strikes:${this.guildId}`,
      () =>
        prisma.oldModerationStrikes.findMany({
          where: { serverId: this.guild.id },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      !(
        this instanceof ButtonInteraction &&
        !this.component.label &&
        this.component.style === 'PRIMARY'
      ),
    )
  ).map((e) => formatOldModEntry(e));

  const data = [
    ...(await fetchWithCache(
      `mod_history:${this.guildId}`,
      () =>
        prisma.moderationEntry.findMany({
          where: { guildId: this.guild.id },
          orderBy: {
            id: 'desc',
          },
        }),
      !(
        this instanceof ButtonInteraction &&
        !this.component.label &&
        this.component.style === 'PRIMARY'
      ),
    )),
    ...oldData,
  ].filter((a) => (filters?.targetId ? a.targetId === filters?.targetId : a));

  return data;
}

function formatOldModEntry(entry: OldModerationStrikes): ModerationEntry {
  const enumConvert: Record<ModerationStrikeTypes, ModerationAction> = {
    BAN: ModerationAction.UserBan,
    CLEAR: ModerationAction.ChannelMessageClear,
    KICK: ModerationAction.UserKick,
    REPORT: ModerationAction.UserReport,
    TEMPBAN: ModerationAction.UserTemporaryBan,
    TIMEOUT: ModerationAction.UserTimeout,
    WARN: ModerationAction.UserWarn,
  };

  return {
    id: dateToSnowflake(entry.createdAt),
    reason: entry.reason,
    targetId: entry.targetId,
    type: enumConvert[entry.type],
    userId: entry.moderatorId,
    guildId: entry.serverId,
    endDate: entry.expiresAt,
    details: entry.details,
    oldId: entry.id,
  };
}

interface PageBtnProps {
  page: number;
  tId?: string;
  s?: boolean;
}

export default ChatCommand({
  name: 'moderation history',
  description: t('en-US', 'modlogs_all.description'),
  descriptionLocalizations: getAllLanguages('modlogs_all.description'),
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', t('en-US', 'USER_TYPE_COMMAND_OPTION_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('USER', localeLower),
      descriptionLocalizations: getAllLanguages('USER_TYPE_COMMAND_OPTION_DESCRIPTION'),
    })
    .channel('channel', t('en-US', 'channel_info.options.channel.description'), {
      nameLocalizations: getAllLanguages('CHANNEL', localeLower),
      descriptionLocalizations: getAllLanguages('channel_info.options.channel.description'),
    }),
  async handle({ user, channel }) {
    if (
      !(user && user.id === this.user.id) &&
      !hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)
    ) {
      return CRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS').replace('{PERMISSIONS}', 'Manage Server'),
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    const res = await renderModlogs.call(
      this,
      0,
      {
        targetId: user?.id || channel?.id,
      },
      !!user,
    );

    await this.editReply(res);
  },
});

function renderEntry(entry: ModerationEntry, locale: string, entries: ModerationEntry[]): string {
  const expires =
    Date.now() < (entry.endDate?.getTime() ?? 0)
      ? `(Expires ${timestampMention(entry.endDate, 'R')}) `
      : '';
  const unlockedOn =
    entry.type === ModerationAction.ChannelLock && entry.endDate
      ? `(${t(locale, 'MOD_VERB_UNLOCK')} ${timestampMention(entry.endDate, 'R')}) `
      : '';
  //  const reason = `**${t(
  //   locale,
  //    entry.type === ModerationAction.UserReport ? 'DESCRIPTION' : 'REASON',
  //  )}:** ${
  //   entry.details ? `[${t(locale, 'MESSAGE_FROM_USER')}]` : entry.reason ?? `*${t(locale, 'NONE')}*`
  // }`;
  const target = !ChannelModerationActions.includes(entry.type)
    ? `<@${entry.targetId}>`
    : `<#${entry.targetId}>`;

  return `${entries.indexOf(entry) + 1}. ${timestampMention(snowflakeToDate(entry.id), 't')} <@${
    entry.userId
  }> ${t(locale, `MOD_VERB_${moderationVerbStrings[entry.type]}` as any, {
    target: '',
  }).toLocaleLowerCase(locale)} ${target} ${expires}`;
  // value: dedent`

  // ${reason}
  // `,
  // };
}

export async function renderModlogs(
  this: Interaction,
  page: number = 0,
  filters?: ModerationHistoryFilters,
  isUser = false,
) {
  const user = filters?.targetId && isUser ? await this.client.users.fetch(filters.targetId) : null;

  const data = await getAllEntries.call(this, filters);

  const results = data
    // .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(page * 10, page * 10 + 10);

  const grouped = Object.entries(
    data.reduce((acc, cur) => {
      const date = snowflakeToDate(cur.id).toDateString();

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(cur);

      return acc;
    }, {} as Record<string, ModerationEntry[]>),
  );

  const pages = Math.ceil(grouped.length / 5);

  return {
    embeds: [
      {
        author: user
          ? {
              name: `${formatUsername(user)} - ${t(this, 'MODERATION_LOGS_VIEW_TITLE', {
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
        fields: grouped.map(([date, entries]) => ({
          name: `${timestampMention(new Date(date), 'D')}`,
          value: entries.map((entry) => renderEntry(entry, this.locale, data)).join('\n'),
        })),

        // results.map((entry) => {
        //          return
        //        renderEntry(entry, this.locale, data)
        //    }),
        footer: {
          text: `${t(this, 'MODERATION_LOGS_ENTRIES_TOTAL', {
            entries: data.length,
          })} • ${t(this, 'PAGINATION_PAGE_OUT_OF', {
            page: page + 1,
            pages,
          })}`,
        },
        color: await getColor(user ?? this.guild),
      },
    ],
    components: components(
      row(
        new ModEntrySelectMenu({ page, tId: filters?.targetId })
          .setPlaceholder(t(this, 'MODERATION_LOGS_VIEW_SELECT_MENU_PLACEHOLDER'))
          .setOptions(
            !data || data.length === 0
              ? [{ label: 'h', value: 'h' }]
              : results.map((entry) => {
                  const index = data.indexOf(entry) + 1;
                  const date = snowflakeToDate(entry.id);
                  const target = !ChannelModerationActions.includes(entry.type)
                    ? `@${this.client.users.cache.get(entry.targetId).username}`
                    : `#${this.guild.channels.cache.get(entry.targetId).name}`;

                  return {
                    label: `${index}. ${t(
                      this,
                      `MOD_VERB_${moderationVerbStrings[entry.type]}` as any,
                      {
                        target: '',
                      },
                    )} ${target}`,
                    description: dayjs(date).format('YYYY-MM-DD, HH:mm'),
                    value: entry.id,
                  };
                }),
          )
          .setDisabled(data.length === 0),
      ),
      row(
        // new ShowFiltersBtn().setStyle('SECONDARY').setLabel('Show Filters'),
        new GoToPage({ page: 0, tId: filters?.targetId, s: false })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_first)
          .setDisabled(page <= 0),
        new GoToPage({ page: page - 1, tId: filters?.targetId })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.left_arrow)
          .setDisabled(page <= 0),
        new GoToPage({ page: page + 1, tId: filters?.targetId })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.right_arrow)
          .setDisabled(page >= pages - 1),
        new GoToPage({ page: pages - 1, tId: filters?.targetId, s: true })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_last)
          .setDisabled(page >= pages - 1),
        ...(hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)
          ? [
              new BulkDeleteButton({ page, tId: filters?.targetId })
                .setLabel('Bulk Delete')
                .setStyle('DANGER'),
            ]
          : []),
      ),
    ),
    flags: MessageFlags.Ephemeral,
  };
}

export const GoToPage = ButtonComponent({
  async handle({ page, tId }: PageBtnProps) {
    await this.deferUpdate();

    await this.editReply(await renderModlogs.call(this, page, { targetId: tId }));
  },
});

export const ModEntrySelectMenu = SelectMenuComponent({
  async handle({ page, tId }: PageBtnProps) {
    return this.update(await renderModEntryPage.call(this, this.values[0], { page, tId }));
  },
});

async function renderModEntryPage(
  this: SelectMenuInteraction | ModalSubmitInteraction | ButtonInteraction,
  sId: string,
  { page, tId }: PageBtnProps,
) {
  const data = await getAllEntries.call(this, { targetId: tId });

  // .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const entry: ModerationEntry = data.find(({ id }) => id === sId);
  let lowBudgetMessage: MessageOptions['embeds'];

  if (entry.details) {
    const target = await this.client.users.fetch(entry.targetId);

    lowBudgetMessage = renderLowBudgetMessage({
      details: JSON.parse(entry.details),
      channel: this.channel,
      guild: this.guild,
      author: target,
    });
  }

  return {
    embeds: [
      {
        author: {
          name: t(this, 'MODERATION_LOGS_VIEW_TITLE', {
            SERVER: this.guild.name,
          }),
          icon_url: this.guild.iconURL(),
        },
        title: `${t(this, 'ENTRY_NO', {
          number: data.indexOf(entry) + 1,
        })} • ${t(this, moderationVerbStrings[entry.type])}`,
        fields: [
          {
            name: t(this, entry.type === ModerationAction.UserReport ? 'DESCRIPTION' : 'REASON'),
            value: entry.reason ?? `*${t(this, 'NONE')}*`,
          },
          {
            name: t(this, entry.type === ModerationAction.UserReport ? 'REPORTED_BY' : 'MODERATOR'),
            value: `<@${entry.userId}>`,
            inline: true,
          },
          ...(ChannelModerationActions.includes(entry.type)
            ? [
                {
                  name: t(this, 'CHANNEL'),
                  value: `<#${entry.targetId}>`,
                  inline: true,
                },
              ]
            : [
                {
                  name: t(this, 'USER'),
                  value: `<@${entry.targetId}>`,
                  inline: true,
                },
              ]),
          {
            name: t(this, 'CREATED_ON'),
            value: `${timestampMention(snowflakeToDate(entry.id))} • ${timestampMention(
              snowflakeToDate(entry.id),
              'R',
            )}`,
          },
          ...(entry.endDate
            ? [
                {
                  name: t(
                    this,
                    entry.type === ModerationAction.ChannelLock ? 'MOD_VERB_UNLOCK' : 'END_DATE',
                  ),
                  value: `${timestampMention(entry.endDate)} • ${timestampMention(
                    entry.endDate,
                    'R',
                  )}`,
                },
              ]
            : []),
        ],
        color:
          entry.type === ModerationAction.UserReport
            ? await getColor(this.guild)
            : ModerationColors[entry.type],
      },
      ...(lowBudgetMessage ? lowBudgetMessage : []),
    ],
    components: components(
      row(
        new GoToPage({ page, tId }).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        ...(hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)
          ? [
              ...(entry.type === ModerationAction.UserReport
                ? []
                : [
                    new EditButton({
                      sId,
                      page,
                      tId,
                      old: !!entry.oldId,
                    })
                      .setEmoji(emojis.buttons.pencil)
                      .setLabel(t(this, 'EDIT'))
                      .setStyle('PRIMARY'),
                  ]),
              new DeleteButton({ sId: entry.oldId ?? entry.id, page, tId, old: !!entry.oldId })
                .setEmoji(emojis.buttons.trash_bin)
                .setLabel(t(this, 'DELETE'))
                .setStyle('DANGER'),
            ]
          : []),
      ),
    ),
    flags: MessageFlags.Ephemeral,
  };
}

export const EditButton = ButtonComponent({
  async handle({ sId, tId, old, page }: PageBtnProps & { sId: string; old: boolean }) {
    const entry = (await getAllEntries.call(this)).find(({ id }) => id === sId);

    await this.showModal(
      new EditModal({ page, tId, sId, old })
        .setTitle(`${t(this, 'ENTRY')} - ${t(this, 'EDIT')}`)
        .setComponents(
          row(
            new TextInputComponent()
              .setLabel(t(this, 'REASON'))
              .setValue(entry.reason ?? '')
              .setCustomId('reason')
              .setMaxLength(256)
              .setStyle('PARAGRAPH')
              .setRequired(true),
          ),
        ),
    );
  },
});

export const EditModal = ModalComponent({
  async handle({ sId, tId, page, old }: PageBtnProps & { sId: string; old: boolean }) {
    const reason = this.fields.getTextInputValue('reason');

    if (old) {
      await prisma.oldModerationStrikes.update({
        where: { id: sId },
        data: { reason },
      });

      await fetchWithCache(
        `strikes:${this.guildId}`,
        () =>
          prisma.oldModerationStrikes.findMany({
            where: { serverId: this.guildId },
          }),
        true,
      );
    } else {
      await prisma.moderationEntry.update({
        where: { id: sId },
        data: { reason },
      });

      await fetchWithCache(
        `mod_history:${this.guildId}`,
        () =>
          prisma.moderationEntry.findMany({
            where: { guildId: this.guildId },
          }),
        true,
      );
    }

    await this.update(await renderModEntryPage.call(this, sId, { tId, page }));
  },
});

export const DeleteButton = ButtonComponent({
  async handle({ sId, tId, page, old }: PageBtnProps & { sId: string; old: boolean }) {
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
          new ConfirmDeleteButton({ tId, sId, page, old })
            .setLabel(t(this, 'CONFIRM'))
            .setStyle('DANGER'),
          new GoToPage({ page: 0, tId }).setLabel(t(this, 'CANCEL')).setStyle('SECONDARY'),
        ),
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle({ sId, tId, page, old }: PageBtnProps & { sId: string; old: boolean }) {
    try {
      if (old) {
        await prisma.oldModerationStrikes.delete({ where: { id: sId } });

        await fetchWithCache(
          `strikes:${this.guildId}`,
          () =>
            prisma.oldModerationStrikes.findMany({
              where: { serverId: this.guildId },
            }),
          true,
        );
      } else {
        await prisma.moderationEntry.delete({ where: { id: sId } });

        await fetchWithCache(
          `mod_history:${this.guildId}`,
          () =>
            prisma.moderationEntry.findMany({
              where: { guildId: this.guildId },
            }),
          true,
        );
      }

      await this.update(await renderModlogs.call(this, page, { targetId: tId }));
    } catch (e) {
      UnknownError(this, e);
    }
  },
});

export const BulkDeleteButton = ButtonComponent({
  async handle({ tId, page }: PageBtnProps) {
    await this.update({
      embeds: [
        {
          title: 'Bulk delete entries',
          description: `Choose the entries you would like to delete from the Moderation History.`,
        },
      ],
    });
  },
});
