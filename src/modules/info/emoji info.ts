import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import {
  CustomEmojiRegex,
  formatEmojiURL,
  snowflakeToDate,
  timestampMention,
} from '@purplet/utils';
import { capitalCase } from 'change-case';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ButtonInteraction, Interaction, MessageButton } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';
import emojiJSON from '../../../data/misc/emoji.json';

export function emojiImg(emojiData: typeof emojiJSON[0], size = '120') {
  const emojipediaCode = `${emojiData.name.replace(/ /g, '-')}_${emojiData.codes
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/:/g, '')}`;

  return {
    Twemoji: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/twitter/322/${emojipediaCode}.png`,
    'Google Noto Color': `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/google/350/${emojipediaCode}.png`,
    Samsung: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/samsung/349/${emojipediaCode}.png`,
    Microsoft: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/microsoft/319/${emojipediaCode}.png`,
    WhatsApp: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/whatsapp/326/${emojipediaCode}.png`,
    Facebook: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/facebook/327/${emojipediaCode}.png`,
    Apple: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/apple/325/${emojipediaCode}.png`,
    'Microsoft Teams': `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/microsoft-teams/337/${emojipediaCode}.png`,
  };
}

export default ChatCommand({
  name: 'emoji info',
  description: 'Get info on a given emoji.',
  options: new OptionBuilder().string(
    'emoji',
    'The emoji whose info to get. Works with custom emojis and standard Unicode emoji.',
    { required: true }
  ),
  async handle({ emoji }) {
    if (CustomEmojiRegex.test(emoji)) {
      const emojiData = {
        animated: emoji.split(':')[0] === '<a',
        name: emoji.replace(CustomEmojiRegex, '$1'),
        id: emoji.replace(CustomEmojiRegex, '$2'),
        url: formatEmojiURL(emoji.replace(CustomEmojiRegex, '$2'), {
          format: emoji.split(':')[0] === '<a' ? 'gif' : 'png',
        }),
        createdAt: snowflakeToDate(emoji.split(':')[2].replace('>', '')),
      };

      const isEmojiInServer = this.guild.emojis.cache.has(emojiData.id);

      await this.reply({
        embeds: [
          {
            author: {
              name: `${emojiData.name} - Emoji info`,
              iconURL: emojiData.url,
            },
            fields: [
              {
                name: 'ID',
                value: emojiData.id,
                inline: true,
              },
              {
                name: 'Animated',
                value: emojiData.animated ? 'Yes' : 'No',
                inline: true,
              },
              {
                name: 'Added',
                value: `${timestampMention(emojiData.createdAt)} • ${timestampMention(
                  emojiData.createdAt,
                  'R'
                )}`,
              },
            ],
            image: {
              url: emojiData.url,
            },
            color: await getColor(this.user),
          },
        ],
        components: isEmojiInServer
          ? []
          : components(
              row(
                new AddEmojiButton(emoji)
                  .setStyle('SECONDARY')
                  .setLabel('Clone to this server')
                  .setEmoji(emojis.buttons.add)
              )
            ),
      });
    } else if (emojiJSON.find((e) => e.char === emoji)) {
      const emojiData = emojiJSON.find((e) => e.char === emoji);

      return this.reply(await renderUnicodeEmoji.call(this, emojiData.codes));
    } else {
      await CRBTError(this, {
        title: 'Could not find that emoji',
        description: `Try using a default Unicode emoji 😀, or a custom emoji. ${emojis.emotiguy.coolwoah}`,
      });
    }
  },
});

async function renderUnicodeEmoji(
  this: Interaction,
  emojiCodes: string,
  vendor: string = 'Twemoji'
) {
  const emojiData = emojiJSON.find((e) => e.codes === emojiCodes);

  const emojiURL = emojiImg(emojiData)[vendor];

  return {
    embeds: [
      {
        author: {
          name: `${capitalCase(emojiData.name)} - Emoji info`,
          icon_url: emojiURL,
        },
        description: `**[View on Emojipedia](https://emojipedia.org/${emojiData.char})**`,
        fields: [
          {
            name: 'Unicode',
            value: emojiData.codes,
            inline: true,
          },
          {
            name: 'Available since',
            value: `**[Unicode ${emojiData.unicode}](https://emojipedia.org/unicode-${emojiData.unicode})**`,
            inline: true,
          },
          {
            name: 'Category',
            value: emojiData.category,
            inline: true,
          },
        ],
        image: {
          url: emojiURL,
        },
        color:
          this instanceof ButtonInteraction
            ? this.message.embeds[0].color
            : await getColor(this.user),
      },
    ],
    components: components(
      row(
        new EmojiDesignSelect(emojiCodes).setOptions(
          Object.entries(emojiImg(emojiData)).map(([brand, url]) => ({
            label: brand === vendor ? `Viewing design: ${capitalCase(brand)}` : brand,
            value: brand,
            default: brand === vendor,
          }))
        )
      )
    ),
  };
}

export const EmojiDesignSelect = SelectMenuComponent({
  async handle(emojiCodes: string) {
    const vendor = this.values[0];

    await this.update(await renderUnicodeEmoji.call(this, emojiCodes, vendor));
  },
});

export const AddEmojiButton = ButtonComponent({
  async handle(emojiString: string) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageEmojisAndStickers)) {
      return CRBTError(this, 'You do not have permission to add emojis to this server.');
    }

    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageEmojisAndStickers)) {
      return CRBTError(this, 'I do not have permission to add emojis to this server.');
    }

    const emojiData = {
      animated: emojiString.split(':')[0] === '<a',
      name: emojiString.split(':')[1],
      id: emojiString.split(':')[2].replace('>', ''),
      url: `https://cdn.discordapp.com/emojis/${emojiString.split(':')[2].replace('>', '')}.${
        emojiString.split(':')[0] === '<a' ? 'gif' : 'png'
      }`,
    };

    await this.guild.emojis.create(emojiData.url, emojiData.name);

    await this.update({
      components: components(
        row(
          new MessageButton()
            .setStyle('SECONDARY')
            .setLabel('Clone to this server')
            .setEmoji(emojis.buttons.add)
            .setDisabled(true)
        )
      ),
    });

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} Successfully added :${emojiData.name}: to this server!`,
        },
      ],
    });
  },
});
