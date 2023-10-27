import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import {
  CustomEmojiRegex,
  formatEmojiURL,
  snowflakeToDate,
  timestampMention,
} from '@purplet/utils';
import { capitalCase } from 'change-case-all';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Interaction, MessageButton, MessageComponentInteraction } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  OptionBuilder,
  SelectMenuComponent,
  components,
  row,
} from 'purplet';
import emojiJSON from '../../../static/misc/emoji.json';

export function emojiImg(emojiData: (typeof emojiJSON)[0], size = '120') {
  const emojipediaCode = `${emojiData.name.replace(/ /g, '-')}_${emojiData.codes
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/:/g, '')}`;

  return {
    Apple: `https://em-content.zobj.net/thumbs/${size}/apple/325/${emojipediaCode}.png`,
    'Google Noto Color Emoji': `https://em-content.zobj.net/thumbs/${size}/google/350/${emojipediaCode}.png`,
    Samsung: `https://em-content.zobj.net/thumbs/${size}/samsung/349/${emojipediaCode}.png`,
    Microsoft: `https://em-content.zobj.net/thumbs/${size}/microsoft/319/${emojipediaCode}.png`,
    WhatsApp: `https://em-content.zobj.net/thumbs/${size}/whatsapp/326/${emojipediaCode}.png`,
    'Twitter / X': `https://em-content.zobj.net/thumbs/${size}/twitter/322/${emojipediaCode}.png`,
    Facebook: `https://em-content.zobj.net/thumbs/${size}/facebook/327/${emojipediaCode}.png`,
  };
}

export default ChatCommand({
  name: 'emoji info',
  nameLocalizations: getAllLanguages('EMOJI', localeLower),
  description: t('en-US', 'emoji_info.description'),
  descriptionLocalizations: getAllLanguages('emoji_info.description'),
  options: new OptionBuilder().string('emoji', t('en-US', 'emoji_info.options.emoji.description'), {
    nameLocalizations: getAllLanguages('EMOJI', localeLower),
    descriptionLocalizations: getAllLanguages('emoji_info.options.emoji.description'),
    required: true,
  }),
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
              name: `:${emojiData.name}: - ${t(this, 'EMOJI_INFO')}`,
              iconURL: emojiData.url,
            },
            fields: [
              {
                name: t(this, 'ID'),
                value: emojiData.id,
                inline: true,
              },
              {
                name: t(this, 'ADDED'),
                value: `${timestampMention(emojiData.createdAt)} • ${timestampMention(
                  emojiData.createdAt,
                  'R',
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
                  .setLabel(t(this, 'CLONE_TO_THIS_SERVER'))
                  .setEmoji(emojis.buttons.add),
              ),
            ),
      });
    } else if (emojiJSON.find((e) => e.char === emoji)) {
      const emojiData = emojiJSON.find((e) => e.char === emoji);

      return this.reply(await renderUnicodeEmoji.call(this, emojiData.codes));
    } else {
      return await CRBTError(this, {
        title: t(this, 'EMOJI_INFO_ERROR_UNKNOWN_TITLE'),
        description: t(this, 'EMOJI_INFO_ERROR_UNKNOWN_DESCRIPTION', {
          standardEmoji: '😊',
          customEmoji: emojis.emotiguy.coolwoah,
        }),
      });
    }
  },
});

async function renderUnicodeEmoji(
  this: Interaction,
  emojiCodes: string,
  vendor: keyof ReturnType<typeof emojiImg> = 'Twitter / X',
) {
  const emojiData = emojiJSON.find((e) => e.codes === emojiCodes);

  const emojiURL = emojiImg(emojiData)[vendor];

  return {
    embeds: [
      {
        author: {
          name: `${capitalCase(emojiData.name)} - ${t(this, 'EMOJI_INFO')}`,
          icon_url: emojiURL,
        },
        fields: [
          {
            name: 'Unicode',
            value: emojiData.codes,
            inline: true,
          },
          {
            name: t(this, 'AVAILABLE_SINCE'),
            value: `**[Unicode ${emojiData.unicode}](https://emojipedia.org/unicode-${emojiData.unicode})**`,
            inline: true,
          },
          {
            name: t(this, 'CATEGORY'),
            value: emojiData.category,
            inline: true,
          },
        ],
        image: {
          url: emojiURL,
        },
        color:
          this instanceof MessageComponentInteraction
            ? this.message.embeds[0].color
            : await getColor(this.user),
      },
    ],

    components: components(
      row(
        new EmojiDesignSelect(emojiCodes).setOptions(
          Object.entries(emojiImg(emojiData)).map(([brand, url]) => ({
            label: brand,
            value: brand,
            default: brand === vendor,
          })),
        ),
      ),
      row(
        new MessageButton({
          label: t(this, 'EMOJI_INFO_EMOJIPEDIA_BUTTON'),
          url: `https://emojipedia.org/${emojiData.char}`,
          style: 'LINK',
        }),
      ),
    ),
  };
}

export const EmojiDesignSelect = SelectMenuComponent({
  async handle(emojiCodes: string) {
    const vendor = this.values[0];

    await this.update(await renderUnicodeEmoji.call(this, emojiCodes, vendor as any));
  },
});

export const AddEmojiButton = ButtonComponent({
  async handle(emojiString: string) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuildExpressions)) {
      return CRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS', {
          PERMISSIONS: 'Manage Expressions',
        }),
      );
    }

    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageGuildExpressions)) {
      return CRBTError(
        this,
        t(this, 'ERROR_BOT_MISSING_PERMISSIONS', {
          PERMISSIONS: 'Manage Expressions',
        }),
      );
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
            .setLabel(t(this, 'CLONE_TO_THIS_SERVER'))
            .setEmoji(emojis.buttons.add)
            .setDisabled(true),
        ),
      ),
    });

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} ${t(this, 'EMOJI_INFO_CLONE_SUCCESS', {
            emoji: `:${emojiData.name}:`,
          })}`,
          color: colors.success,
        },
      ],
    });
  },
});
