import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { ButtonComponent, OnEvent, components, row } from 'purplet';
import { saveServerSettings } from '../server-settings/_helpers';
import { ToggleFeatureBtn, guildFeatureSettings } from '../server-settings/settings';

export const modlogsSettings: SettingsMenuProps = {
  mainMenu: EditableGuildFeatures.moderation,
  description: (l) => t(l, 'SETTINGS_MODLOGS_SHORT_DESCRIPTION'),
  getErrors({ guild, settings, i }) {
    const channelId = settings.modLogsChannelId;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (settings.modules.moderationNotifications && channelId && !channel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (settings.modules.moderationNotifications && !channelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }

    return errors;
  },
  async renderMenuMessage({ settings, i, backBtn }) {
    const isUserOwner = i.guild.ownerId === i.user.id;

    const ownerMemberData = isUserOwner
      ? (await prisma.guildMember.findFirst({
          where: {
            userId: i.user.id,
            guildId: i.guildId,
          },
          select: {
            moderationNotifications: true,
          },
        })) ?? { moderationNotifications: false }
      : null;

    return {
      embeds: [
        {
          description: t(i, 'SETTINGS_MODLOGS_DESCRIPTION'),
          fields: [
            {
              name: t(i, 'STATUS'),
              value: settings.modules.moderationNotifications
                ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
                : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
              inline: true,
            },
            ...(settings.modLogsChannelId
              ? [
                  {
                    name: t(i, 'CHANNEL'),
                    value: `<#${settings.modLogsChannelId}>`,
                    inline: true,
                  },
                ]
              : []),
          ],
        },
      ],
      components: components(
        row(
          new MessageSelectMenu()
            .setType('CHANNEL_SELECT')
            .addChannelTypes(
              ...([
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.PublicThread,
                ChannelType.PrivateThread,
              ] as number[]),
            )
            .setCustomId(modlogsCustomId)
            .setDisabled(!settings.modules.moderationNotifications)
            .setPlaceholder(t(i, 'EDIT_CHANNEL')),
        ),
        row(
          backBtn,
          new ToggleFeatureBtn({
            feature: EditableGuildFeatures.moderationNotifications,
            newState: !settings.modules.moderationNotifications,
          })
            .setLabel(settings.modules.moderationNotifications ? t(i, 'DISABLE') : t(i, 'ENABLE'))
            .setLabel(
              settings.modules.moderationNotifications
                ? t(i, 'DISABLE_FEATURE')
                : t(i, 'ENABLE_FEATURE'),
            )
            .setStyle(settings.modules.moderationNotifications ? 'DANGER' : 'SUCCESS'),
          ...(isUserOwner
            ? [
                new ToggleDMNotifications({
                  newState: !ownerMemberData.moderationNotifications,
                })
                  .setLabel('Always send Notifications in DMs')
                  .setEmoji(
                    ownerMemberData.moderationNotifications ? emojis.toggle.on : emojis.toggle.off,
                  )
                  .setStyle('SECONDARY'),
              ]
            : []),
        ),
      ),
    };
  },
};

export const modlogsCustomId = 'hlogsselect';

export const EditLogsChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (i.isChannelSelect() && i.customId === modlogsCustomId) {
    const channel = i.channels.first();

    await saveServerSettings(i.guildId, {
      modLogsChannelId: channel.id,
    });

    i.update(await guildFeatureSettings.call(i, EditableGuildFeatures.moderationNotifications));
  }
});

export const ToggleDMNotifications = ButtonComponent({
  async handle({ newState }: { newState: boolean }) {
    const id = `${this.user.id}_${this.guildId}`;

    await prisma.guildMember.upsert({
      create: {
        id,
        userId: this.user.id,
        guildId: this.guildId,
        moderationNotifications: newState,
        dailyStreak: 0,
      },
      where: {
        id,
      },
      update: {
        moderationNotifications: newState,
      },
    });

    await this.update(
      await guildFeatureSettings.call(this, EditableGuildFeatures.moderationNotifications),
    );
  },
});
