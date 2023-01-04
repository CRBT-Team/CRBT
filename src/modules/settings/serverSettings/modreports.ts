import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { SnowflakeRegex } from '@purplet/utils';
import { TextInputStyle } from 'discord-api-types/v10';
import { ButtonComponent, components, ModalComponent, row } from 'purplet';
import { renderFeatureSettings } from './settings';
import { getSettings, include } from './_helpers';

export const modReportsSettings: SettingsMenus = {
  getErrors({ guild, settings, isEnabled, i }) {
    const channelId = settings.modReportsChannel;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push('Channel not found. Edit it for CRBT to send new reports.');
    }
    if (isEnabled && !channelId) {
      errors.push(`No channel was set. Use the ${t(i, 'EDIT_CHANNEL')} button to continue setup.`);
    }

    return errors;
  },
  getSelectMenu: ({ settings, guild, isEnabled }) => {
    const channel = guild.channels.cache.find((c) => c.id === settings.modReportsChannel);

    return {
      emoji: emojis.toggle[isEnabled ? 'on' : 'off'],
      description: isEnabled ? `Sending in #${channel.name}` : null,
    };
  },
  getMenuDescription({ settings, isEnabled, i }) {
    return {
      description:
        "Moderation Reports allow your members to report a message or user (by right-clicking or long-pressing them) to your server's moderation team. Reports will be sent in the chosen channel.",
      fields: [
        {
          name: t(i, 'STATUS'),
          value: isEnabled
            ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
            : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
          inline: true,
        },
        ...(settings.modReportsChannel
          ? [
              {
                name: t(i, 'CHANNEL'),
                value: `<#${settings.modReportsChannel}>`,
                inline: true,
              },
            ]
          : []),
      ],
    };
  },
  getComponents: ({ backBtn, toggleBtn, i, isEnabled }) =>
    components(
      row(
        backBtn,
        toggleBtn,
        new EditReportsChannelBtn()
          .setLabel(t(i, 'EDIT_CHANNEL'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setDisabled(!isEnabled)
      )
    ),
};

export const EditReportsChannelBtn = ButtonComponent({
  async handle() {
    const { modReportsChannel } = await getSettings(this.guild.id);
    const channelName = modReportsChannel
      ? this.guild.channels.cache.get(modReportsChannel)?.name ?? ''
      : '';

    this.showModal(
      new EditReportsChannelModal(null).setTitle(`Edit Moderation Reports Channel`).setComponents(
        row({
          type: 'TEXT_INPUT',
          custom_id: 'channel',
          placeholder: t(this, 'EDIT_CHANNEL_MODAL_PLACEHOLDER'),
          label: t(this, 'CHANNEL'),
          value: channelName,
          required: true,
          style: TextInputStyle.Short,
          max_length: 100,
        })
      )
    );
  },
});

export const EditReportsChannelModal = ModalComponent({
  async handle() {
    const channelInput = this.fields.getTextInputValue('channel');

    const channel = SnowflakeRegex.test(channelInput)
      ? await this.guild.channels.fetch(channelInput)
      : (await this.guild.channels.fetch())?.find((c) => c.name === channelInput);

    if (!channel || channel.type !== 'GUILD_TEXT') {
      return CRBTError(this, 'This channel does not exist or is not a text channel.');
    }

    await fetchWithCache(
      `${this.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: this.guild.id },
          update: { modReportsChannel: channel.id },
          create: { id: this.guildId, modReportsChannel: channel.id },
          include,
        }),
      true
    );

    this.update(await renderFeatureSettings.call(this, EditableFeatures.moderationReports));
  },
});
