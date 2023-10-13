import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import dedent from 'dedent';
import { MessageAttachment, MessageButton } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { GuildSettingMenus, getGuildSettings } from './_helpers';
import { BackSettingsButton } from './settings';

export const privacySettings: SettingsMenuProps = {
  newLabel: true,
  description: (l) => t(l, 'SETTINGS_PRIVACY_SHORT_DESCRIPTION'),
  async renderMenuMessage({ i, guild, backBtn, settings }) {
    return {
      embeds: [
        {
          description: t(i, 'SETTINGS_PRIVACY_DESCRIPTION'),
        },
      ],
      components: components(
        row(
          backBtn,
          ...(settings.isDefault
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
                  .setLabel(t(i, 'DELETE_ALL_DATA'))
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

    const data = await getGuildSettings(this.guildId, true);

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
    await this.deferUpdate();

    const { moderationHistory, modules, giveaways, polls } = await getGuildSettings(
      this.guildId,
      true,
    );

    await this.editReply({
      embeds: [
        {
          title: t(this, 'GUILD_PRIVACY_DELETE_DATA_CONFIRM_TITLE', {
            guildName: this.guild.name,
          }),
          description: dedent`
          ${t(this, 'GUILD_PRIVACY_DELETE_DATA_CONFIRM_DESCRIPTION')}
          - ${t(this, 'X_SETTINGS', {
            number: (Object.keys(modules)?.length || 0) - 1 + GuildSettingMenus.size - 1,
          })}
          - ${t(this, 'ENTIRETY_OF_MODERATION_HISTORY')} (${t(
            this,
            'X_MODERATION_HISTORY_ENTRIES',
            { number: moderationHistory?.length || 0 },
          )})
          - ${t(this, 'X_POLLS', { number: polls?.length || 0 })}
          - ${t(this, 'X_GIVEAWAYS', { number: giveaways?.length || 0 })}
          ### **⚠️ ${t(this, 'DELETE_CONFIRMATION_DESCRIPTION')}**
          `,
          color: colors.error,
        },
      ],
      components: components(
        row(
          new BackSettingsButton(EditableGuildFeatures.privacy)
            .setLabel(t(this, 'CANCEL'))
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
          new ConfirmDeleteButton().setLabel(t(this, 'CONFIRM')).setStyle('DANGER'),
        ),
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle() {
    await this.deferUpdate();

    await prisma.guildMember.deleteMany({
      where: { guildId: this.guildId },
    });

    await prisma.guildModules.deleteMany({
      where: { id: this.guildId },
    });

    await prisma.economy.deleteMany({
      where: { id: this.guildId },
    });

    await prisma.guild.delete({
      where: {
        id: this.guildId,
      },
      include: {
        achievements: true,
        giveaways: true,
        moderationHistory: true,
        polls: true,
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
