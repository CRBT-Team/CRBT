import { emojis } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import { titleCase } from 'change-case-all';
import dedent from 'dedent';
import { components, row } from 'purplet';
import { formatEntry, getAllEntries } from '../../../moderation/moderation_history';
import { GuildSettingMenus, resolveSettingsProps } from '../../server-settings/_helpers';
import { FeatureSelectMenu } from '../../server-settings/settings';

export const moderationSettings: SettingsMenuProps = {
  description: (l) => t(l, 'SETTINGS_MODERATION_SHORT_DESCRIPTION'),
  async renderMenuMessage({ settings, i, guild, backBtn }) {
    const channelId = settings.modLogsChannelId;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (settings.modules.moderationNotifications && channelId && !channel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (settings.modules.moderationNotifications && !channelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }

    const modHistory = await getAllEntries.call(i);

    return {
      embeds: [
        {
          fields: [
            {
              name: t(i, 'FEATURES'),
              value: dedent`
              ${
                settings.modules.moderationNotifications ? emojis.toggle.on : emojis.toggle.off
              } ${t(i, 'MODERATION_LOGS')}${
                settings.modLogsChannelId ? `: <#${settings.modLogsChannelId}>` : ''
              }
              ${settings.modules.moderationReports ? emojis.toggle.on : emojis.toggle.off} ${t(
                i,
                'MODERATION_REPORTS',
              )}${settings.modReportsChannelId ? `: <#${settings.modReportsChannelId}>` : ''}
              `,
              inline: true,
            },
            {
              name: `Entries • ${modHistory.length}`,
              value: [
                ...modHistory.slice(0, 3).map((entry) => {
                  const entryString = formatEntry(entry, i.locale, modHistory);

                  return `${entryString}`;
                }),
                `*${t(i, 'MORE_ELEMENTS', {
                  number: modHistory.length - 3,
                })}*`,
              ].join('\n'),
            },
            {
              name: 'Commands',
              value: [
                {
                  type: 'general',
                  commands: ['moderation history'],
                },
                {
                  type: 'user',
                  commands: ['ban', 'kick', 'timeout', 'warn'],
                },
                {
                  type: 'channel',
                  commands: ['clear', 'lock', 'unlock'],
                },
              ]
                .map(
                  ({ type, commands }) =>
                    `- ${titleCase(type)}: ${commands
                      .map((command) => slashCmd(command))
                      .join(' ')}`,
                )
                .join('\n'),
            },
          ],
        },
      ],
      components: components(
        row(
          new FeatureSelectMenu()
            .setType('SELECT_MENU')
            .setPlaceholder(t(i, 'FEATURES'))
            .setOptions(
              [
                EditableGuildFeatures.moderationNotifications,
                EditableGuildFeatures.moderationReports,
              ].map((featureId) => {
                const menu = GuildSettingMenus.get(featureId);
                const props = resolveSettingsProps(i, menu, settings);

                let icon = props.errors.length ? '⚠️' : (emojis.features?.[featureId] ?? '');
                let description = props.errors.length
                  ? t(i, 'ATTENTION_REQUIRED')
                  : menu.description(i.locale);

                return {
                  label: `${t(i, featureId)} ${menu.newLabel ? `[✨ ${t(i, 'NEW')}]` : ''}`,
                  description: props.errors.length ? t(i, 'ATTENTION_REQUIRED') : description,
                  value: featureId,
                  emoji: icon,
                };
              }),
            ),
        ),
        row(backBtn),
      ),
    };
  },
};
