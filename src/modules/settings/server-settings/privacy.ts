import { prisma } from '$lib/db';
import { colors, emojis, icons } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import dedent from 'dedent';
import { MessageAttachment, MessageButton } from 'discord.js';
import { ButtonComponent, components, row, SelectMenuComponent } from 'purplet';
import {
  defaultGuildSettings,
  getGuildSettings,
  include,
  isDefaultGuildSettings,
} from './_helpers';
import { BackSettingsButton } from './settings';
import { getColor } from '$lib/functions/getColor';
import { Guild, GuildModules } from '@prisma/client';
import { removeEconomyGuildCommands } from './economy/CommandsButtons';

export const privacySettings: SettingsMenuProps = {
  description: (l) => t(l, 'SETTINGS_PRIVACY_SHORT_DESCRIPTION'),
  async renderMenuMessage({ i, guild, backBtn, settings }) {
    const isDefault = isDefaultGuildSettings(settings);

    return {
      embeds: [
        {
          description: t(i, 'SETTINGS_PRIVACY_DESCRIPTION'),
        },
      ],
      components: components(
        row(
          backBtn,
          ...(isDefault
            ? [
                new MessageButton()
                  .setCustomId('h')
                  .setLabel(t(i, 'GUILD_NO_DATA'))
                  .setStyle('SECONDARY')
                  .setDisabled(),
              ]
            : [
                new ExportDataButton().setLabel(t(i, 'DOWNLOAD_ALL_DATA')).setStyle('PRIMARY'),
                new DeleteDataButton()
                  .setLabel(t(i, 'DELETE_DATA'))
                  .setStyle('DANGER')
                  .setDisabled(guild.ownerId !== i.user.id),
              ]),
        ),
      ),
    };
  },
};

export const ExportDataButton = ButtonComponent({
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    const data = await prisma.guild.findFirst({
      where: { id: this.guildId },
      include: include,
    });

    await this.editReply({
      files: [
        new MessageAttachment(Buffer.from(JSON.stringify(data, null, 2))).setName(
          `guild_data_${this.guildId}.json`,
        ),
      ],
    });
  },
});

export const DeleteDataButton = ButtonComponent({
  async handle() {
    await this.update({
      embeds: [
        {
          author: {
            name: `${this.guild.name} - Data deletion`,
            iconURL: icons.settings,
          },
          title: 'What data would you like to delete?',
          description: dedent`
            When choosing a feature to delete, CRBT will delete the data and reset the feature to its default settings.

            You will be prompted to confirm the deletion of the selected data.
          `,
          color: await getColor(this.guild),
        },
      ],
      components: components(
        row(
          new DataSelectMenu(null)
            .setOptions([
              {
                label: t(this, 'SERVER_THEME'),
                value: EditableGuildFeatures.automaticTheming,
                emoji: emojis.features.SERVER_THEME,
              },
              {
                label: t(this, 'JOIN_LEAVE'),
                value: EditableGuildFeatures.joinLeave,
                emoji: emojis.features.JOIN_LEAVE,
              },
              {
                label: t(this, 'MODERATION'),
                value: EditableGuildFeatures.moderation,
                emoji: emojis.features.MODERATION,
              },
              {
                label: t(this, 'MODERATION_HISTORY'),
                value: 'modlogs',
                emoji: '📜',
              },
              {
                label: t(this, 'GIVEAWAYS'),
                value: 'giveaways',
                emoji: emojis.tada,
              },
              {
                label: t(this, 'ECONOMY'),
                value: EditableGuildFeatures.economy,
                emoji: emojis.features.ECONOMY,
              },
            ])
            .setMaxValues(6)
            .setPlaceholder('Select features whose data you want to delete'),
        ),
        row(
          new BackSettingsButton(EditableGuildFeatures.privacy)
            .setLabel(t(this, 'CANCEL'))
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
        ),
      ),
    });
  },
});

export const DataSelectMenu = SelectMenuComponent({
  async handle() {
    const features = this.values as (EditableGuildFeatures | string)[];

    await this.deferUpdate();

    const { moderationHistory, giveaways, economy } = await getGuildSettings(this.guildId, true);

    let description = `${t(this, 'GUILD_PRIVACY_DELETE_DATA_CONFIRM_DESCRIPTION')}\n`;

    if (features.includes(EditableGuildFeatures.automaticTheming)) {
      description += `- Theming settings\n`;
    }

    if (features.includes(EditableGuildFeatures.joinLeave)) {
      description += `- Welcome & Farewell settings\n`;
    }

    if (features.includes(EditableGuildFeatures.economy)) {
      description += `- The server's Economy and settings, including all ${economy.items.length} items, ${economy.categories.length} categories, command settings, and the money of all members.\n`;
    }

    if (features.includes(EditableGuildFeatures.moderation)) {
      description += `- Moderation settings\n`;
    }

    if (features.includes('modlogs')) {
      description += `- ${t(this, 'ENTIRETY_OF_MODERATION_HISTORY')} (${t(
        this,
        'X_MODERATION_HISTORY_ENTRIES',
        { number: moderationHistory?.length || 0 },
      )})\n`;
    }

    if (features.includes('giveaways')) {
      description += `- ${t(this, 'X_GIVEAWAYS', { number: giveaways?.length || 0 })}\n`;
    }

    await this.editReply({
      embeds: [
        {
          title: t(this, 'GUILD_PRIVACY_DELETE_DATA_CONFIRM_TITLE', {
            guildName: this.guild.name,
          }),
          description: `${description}### **⚠️ ${t(this, 'DELETE_CONFIRMATION_DESCRIPTION')}**`,
          color: colors.error,
        },
      ],
      components: components(
        row(
          new DeleteDataButton()
            .setLabel(t(this, 'CANCEL'))
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
          new ConfirmDeleteButton(features.join(','))
            .setLabel(t(this, 'CONFIRM'))
            .setStyle('DANGER'),
        ),
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle(features: string) {
    const featuresArr = features.split(',');

    await this.deferUpdate();

    await this.editReply({
      embeds: [
        {
          title: `${emojis.pending} ${t(this, 'LOADING_TITLE')}`,
          color: colors.yellow,
        },
      ],
      components: components(
        ...this.message.components.map((r) =>
          row().addComponents(r.components.map((b) => ({ ...b, disabled: true }))),
        ),
      ),
    });

    const updatedData: Partial<
      Guild & {
        modules: Partial<GuildModules>;
      }
    > = {
      modules: {},
    };

    if (featuresArr.includes(EditableGuildFeatures.automaticTheming)) {
      updatedData.accentColor = defaultGuildSettings.accentColor;
      updatedData.isAutoThemingEnabled = defaultGuildSettings.isAutoThemingEnabled;
      updatedData.iconHash = null;
    }

    if (featuresArr.includes(EditableGuildFeatures.joinLeave)) {
      updatedData.joinMessage = null;
      updatedData.leaveMessage = null;
      updatedData.joinChannelId = null;
      updatedData.leaveChannelId = null;
      updatedData.modules.joinMessage = false;
      updatedData.modules.leaveMessage = false;
    }

    if (featuresArr.includes(EditableGuildFeatures.economy)) {
      await prisma.item.deleteMany({
        where: { guildId: this.guildId },
      });

      await prisma.guildMember.deleteMany({
        where: { guildId: this.guildId },
      });

      await prisma.economy.deleteMany({
        where: { id: this.guildId },
      });

      await prisma.category.deleteMany({
        where: { guildId: this.guildId },
      });

      await removeEconomyGuildCommands(this.guildId, this.client.application.id);

      updatedData.modules.economy = false;
    }

    if (featuresArr.includes(EditableGuildFeatures.moderation)) {
      updatedData.modLogsChannelId = null;
      updatedData.modReportsChannelId = null;
      updatedData.modules.moderationNotifications = false;
      updatedData.modules.moderationReports = false;
    }

    if (featuresArr.includes('modlogs')) {
      await prisma.moderationEntry.deleteMany({
        where: { guildId: this.guildId },
      });
    }

    if (featuresArr.includes('giveaways')) {
      await prisma.giveaway.deleteMany({
        where: { guildId: this.guildId },
      });
    }

    const { modules, ...everythingElse } = updatedData;

    await prisma.guild.update({
      where: {
        id: this.guildId,
      },
      data: {
        ...everythingElse,
        ...(updatedData.modules
          ? {
              modules: {
                update: {
                  data: updatedData.modules,
                  where: { id: this.guildId },
                },
              },
            }
          : {}),
      },
    });

    await getGuildSettings(this.guildId, true);

    await this.editReply({
      embeds: [
        {
          title: `${emojis.success} ${t(this, 'DELETE_DATA_SUCCESS')}`,
          color: colors.success,
        },
      ],
      components: components(
        row(
          new BackSettingsButton(EditableGuildFeatures.privacy)
            .setLabel(t(this, 'BACK'))
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
        ),
      ),
    });
  },
});
