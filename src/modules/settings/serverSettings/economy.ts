import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis, links } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { CustomEmojiRegex, emojiMention, SnowflakeRegex } from '@purplet/utils';
import dayjs from 'dayjs';
import dedent from 'dedent';
import { Channel, MessageButton } from 'discord.js';
import { ButtonComponent, components, ModalComponent, row } from 'purplet';
import emojiJSON from '../../../../data/misc/emoji.json';
import { renderFeatureSettings } from './settings';
import { getSettings, include } from './_helpers';

export const economySettings: SettingsMenus = {
  getErrors({ settings }) {
    return [];
  },
  getSelectMenu({ settings: { economy }, isEnabled }) {
    return {
      emoji: isEnabled ? economy.currencySymbol : emojis.toggle.off,
      description: economy.currencyNamePlural,
    };
  },
  getMenuDescription({ settings: { economy }, isEnabled }) {
    return {
      description: dedent`
      **⚠️ Economy is in alpha that's being experimented with. If you're seeing this, you've got early access!**
      Have feedback? Got bugs? Join the **[CRBT Community](${links.discord})** or use ${slashCmd(
        'report'
      )}!`,
      fields: [
        {
          name: 'Status',
          value: isEnabled ? `${emojis.toggle.on} Enabled` : `${emojis.toggle.off} Disabled`,
        },
        {
          name: 'Currency',
          value: dedent`${economy.currencySymbol} \`${
            economy.currencySymbol.match(CustomEmojiRegex)
              ? `:${getEmojiObject(economy.currencySymbol).name}:`
              : economy.currencySymbol
          }\`
          ${economy.currencyNameSingular} (${economy.currencyNamePlural})`,
          inline: true,
        },
        {
          name: 'Commands',
          value: dedent`
          ${slashCmd('work')} • \`${dayjs
            .duration(economy.commands.workCooldown, 'ms')
            .asMinutes()}m\` cooldown
          ${[slashCmd('balance'), slashCmd('give')].join('\n')}`,
          inline: true,
        },
        {
          name: `Items • ${economy.items.length}`,
          value:
            economy.items.length === 0
              ? dedent`No items available.
          Click on the "Edit Items" button below to edit items.`
              : `${economy.items.length} across ${economy.categories.length} categories`,
          inline: true,
        },
        {
          name: 'Transaction logs channel',
          value:
            `You can set up a channel to send messages whenever ${economy.currencyNamePlural} are transfered or used to buy items.\n\n` +
            (economy.transactionLogsChannel
              ? `**Set to <#${economy.transactionLogsChannel}>**`
              : 'Set one using the "Edit Channel" button below.'),
        },
      ],
      thumbnail: {
        url: getEmojiURL(economy.currencySymbol),
      },
    };
  },
  getComponents({ backBtn, toggleBtn }) {
    return components(
      row(backBtn, toggleBtn),
      row(
        new EditCurrencyBtn()
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setLabel('Edit Currency'),
        new MessageButton()
          .setCustomId('h')
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setDisabled()
          .setLabel('Edit Items'),
        new EditEconomyLogsBtn()
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setLabel('Edit Logs Channel')
      )
    );
  },
};

export const EditCurrencyBtn = ButtonComponent({
  async handle() {
    const { economy } = await getSettings(this.guildId);

    await this.showModal(
      new EditCurrencyModal().setTitle('Edit Currency').setComponents(
        row({
          style: 'SHORT',
          label: 'Currency name (singular)',
          required: true,
          value: economy.currencyNameSingular,
          minLength: 2,
          maxLength: 30,
          type: 'TEXT_INPUT',
          customId: 'currencyNameSingular',
        }),
        row({
          style: 'SHORT',
          label: 'Currency name (plural)',
          required: true,
          value: economy.currencyNamePlural,
          minLength: 2,
          maxLength: 40,
          type: 'TEXT_INPUT',
          customId: 'currencyNamePlural',
        }),
        row({
          style: 'SHORT',
          label: 'Symbol',
          required: true,
          value: economy.currencySymbol.match(CustomEmojiRegex)
            ? `:${getEmojiObject(economy.currencySymbol).name}:`
            : economy.currencySymbol,
          minLength: 1,
          maxLength: 40,
          placeholder: "You may use an emoji's name, ID, or full ID.",
          type: 'TEXT_INPUT',
          customId: 'currencySymbol',
        })
      )
    );
  },
});

export const EditCurrencyModal = ModalComponent({
  async handle(h: null) {
    const { economy } = await getSettings(this.guildId);
    let currencySymbol = this.fields.getTextInputValue('currencySymbol');

    if (currencySymbol) {
      const emojiObj = getEmojiObject(currencySymbol);
      const fromJSON = emojiJSON.find(
        ({ name }) =>
          name.toLowerCase().replaceAll(' ', '_') ===
          currencySymbol.toLowerCase().replaceAll(' ', '_').replaceAll(':', '')
      );
      const fromEmojis = (await this.guild.emojis.fetch()).find(
        (e) => e.name === currencySymbol.replaceAll(':', '')
      );
      if (emojiObj && emojiObj.name && emojiObj.animated === undefined) {
        currencySymbol = currencySymbol;
      } else if (fromJSON) {
        currencySymbol = fromJSON.char;
      } else if (currencySymbol.match(CustomEmojiRegex)) {
        currencySymbol = currencySymbol;
      } else if (fromEmojis) {
        currencySymbol = emojiMention(fromEmojis);
      } else {
        currencySymbol = null;
      }
    } else {
      currencySymbol = economy.currencyNameSingular;
    }

    if (!currencySymbol) {
      return CRBTError(
        this,
        'The emoji used for the symbol is invalid! Please use a unicode emoji or an emoji in the server using its name or full ID.'
      );
    }

    const newEconomy = {
      currencySymbol,
      currencyNameSingular:
        this.fields.getTextInputValue('currencyNameSingular') ?? economy.currencyNameSingular,
      currencyNamePlural:
        this.fields.getTextInputValue('currencyNamePlural') ?? economy.currencyNamePlural,
    };

    await fetchWithCache(
      `${this.guildId}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: this.guildId },
          create: {
            id: this.guildId,
            economy: { create: newEconomy },
          },
          update: {
            economy: {
              upsert: { create: newEconomy, update: newEconomy },
            },
          },
          include,
        }),
      true
    );

    this.update(await renderFeatureSettings.call(this, EditableFeatures.economy));
  },
});

export const EditEconomyLogsBtn = ButtonComponent({
  async handle() {
    const settings = await getSettings(this.guild.id);
    const channelId = settings.economy.transactionLogsChannel;

    const channelName = channelId ? this.guild.channels.cache.get(channelId)?.name ?? '' : '';

    this.showModal(
      new EditEconomyLogsModal().setTitle(`Edit Transaction Logs Channel`).setComponents(
        row({
          type: 'TEXT_INPUT',
          customId: 'channel',
          placeholder: "You may use a Text Channel's exact name or its ID.",
          label: 'Channel',
          value: channelName,
          required: true,
          style: 'SHORT',
          maxLength: 100,
        })
      )
    );
  },
});

export const EditEconomyLogsModal = ModalComponent({
  async handle(h: null) {
    const channelInput = this.fields.getTextInputValue('channel');
    let channel: Channel;

    if (SnowflakeRegex.test(channelInput)) {
      channel = this.guild.channels.cache.get(channelInput);
      if (!channel || channel.type !== 'GUILD_TEXT') {
        return CRBTError(this, 'This channel does not exist or is not a text channel.');
      }
    } else {
      channel = this.guild.channels.cache.find((c) => c.name === channelInput);
      if (!channel || channel.type !== 'GUILD_TEXT') {
        return CRBTError(this, 'This channel does not exist or is not a text channel.');
      }
    }

    await fetchWithCache(
      `${this.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: this.guild.id },
          update: {
            economy: {
              upsert: {
                create: { transactionLogsChannel: channel.id },
                update: { transactionLogsChannel: channel.id },
              },
            },
          },
          create: {
            id: this.guildId,
            economy: {
              create: { transactionLogsChannel: channel.id },
            },
          },
          include,
        }),
      true
    );

    this.update(await renderFeatureSettings.call(this, EditableFeatures.economy));
  },
});
