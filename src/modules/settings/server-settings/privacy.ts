import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import dedent from 'dedent';
import { MessageAttachment } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { GuildSettingMenus, getGuildSettings } from './_helpers';
import { BackSettingsButton } from './settings';

export const privacySettings: SettingsMenuProps = {
  newLabel: true,
  description: (l) => t(l, 'SETTINGS_PRIVACY_SHORT_DESCRIPTION'),
  async renderMenuMessage({ i, guild, backBtn }) {
    return {
      embeds: [
        {
          description: t(i, 'SETTINGS_PRIVACY_DESCRIPTION'),
        },
      ],
      components: components(
        row(
          backBtn,
          new ExportDataButton().setLabel(t(i, 'DOWNLOAD_ALL_DATA')).setStyle('PRIMARY'),
          new DeleteDataButton()
            .setLabel(t(i, 'DELETE_ALL_DATA'))
            .setStyle('DANGER')
            .setDisabled(guild.ownerId !== i.user.id),
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
            number: Object.keys(modules).length - 1 + GuildSettingMenus.size - 1,
          })}
          - ${t(this, 'ENTIRETY_OF_MODERATION_HISTORY')} (${t(
            this,
            'X_MODERATION_HISTORY_ENTRIES',
            { number: moderationHistory.length },
          )})
          - ${t(this, 'X_POLLS', { number: polls.length })}
          - ${t(this, 'X_GIVEAWAYS', { number: giveaways.length })}
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

    await prisma.guild.delete({
      where: {
        id: this.guildId,
      },
      include: {
        achievements: true,
        economy: true,
        giveaways: true,
        modules: true,
        moderationHistory: true,
        polls: true,
        members: true,
      },
    });

    await this.editReply({
      embeds: [{}],
    });
  },
});
