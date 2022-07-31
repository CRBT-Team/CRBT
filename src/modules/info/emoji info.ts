import { emojis, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { snowStamp } from '$lib/functions/snowStamp';
import { EmojiRegex } from '$lib/util/regex';
import { capitalCase } from 'change-case';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageButton, MessageEmbed } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';
import emojiJSON from '../../../data/misc/emoji.json';

const emojiImg = (emojipediaCode: string, size = '120') => ({
  Twemoji: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/twitter/322/${emojipediaCode}.png`,
  'Google Noto Color': `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/google/313/${emojipediaCode}.png`,
  Facebook: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/facebook/304/${emojipediaCode}.png`,
  Apple: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/apple/325/${emojipediaCode}.png`,
  Microsoft: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/microsoft/310/${emojipediaCode}.png`,
  WhatsApp: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/whatsapp/312/${emojipediaCode}.png`,
  'Microsoft Teams': `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/${size}/microsoft-teams/337/${emojipediaCode}.png`,
});

export default ChatCommand({
  name: 'emoji info',
  description: 'Get info on a given emoji.',
  options: new OptionBuilder().string(
    'emoji',
    'The emoji whose info to get. Works with custom emojis and standard Unicode emoji.',
    { required: true }
  ),
  async handle({ emoji }) {
    if (EmojiRegex.test(emoji)) {
      const emojiData = {
        animated: emoji.split(':')[0] === '<a',
        name: emoji.split(':')[1],
        id: emoji.split(':')[2].replace('>', ''),
        url: `https://cdn.discordapp.com/emojis/${emoji.split(':')[2].replace('>', '')}.${
          emoji.split(':')[0] === '<a' ? 'gif' : 'png'
        }`,
        createdAt: snowStamp(emoji.split(':')[2].replace('>', '')),
      };

      const isEmojiInServer = this.guild.emojis.cache.has(emojiData.id);

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: `${emojiData.name} - Emoji info`, iconURL: emojiData.url })
            .addField('ID', emojiData.id, true)
            .addField('Animated', emojiData.animated ? 'Yes' : 'No', true)
            .addField(
              'Added',
              `<t:${emojiData.createdAt.unix()}> • <t:${emojiData.createdAt.unix()}:R>`
            )
            .setImage(emojiData.url)
            .setColor(await getColor(this.user)),
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
      const emojipediaCode = `${emojiData.name.replace(/ /g, '-')}_${emojiData.codes
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/:/g, '')}`;

      const emojiURL = emojiImg(emojipediaCode).Twemoji;

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${capitalCase(emojiData.name)} - Emoji info`,
              iconURL: emojiURL,
            })
            .setDescription(`**[View on Emojipedia](https://emojipedia.org/${emoji})**`)
            .addField('Unicode', emojiData.codes, true)
            .addField(
              'Available since',
              `**[Unicode ${emojiData.unicode}](https://emojipedia.org/unicode-${emojiData.unicode})**`,
              true
            )
            .addField('Category', emojiData.category, true)
            .setImage(emojiURL)
            .setColor(await getColor(this.user)),
        ],
        components: components(renderSelect(emojipediaCode)),
      });
    } else {
      await this.reply(
        CRBTError(
          'Looks like that emoji does not exist! Try using a default Unicode emoji, or a custom emoji. 😃'
        )
      );
    }
  },
});

function renderSelect(emojipediaCode: string, current = 'Twemoji') {
  return row(
    new EmojiDesignSelect(emojipediaCode).setOptions(
      Object.entries(emojiImg(emojipediaCode)).map(([brand, url]) => ({
        label: brand === current ? `Viewing design: ${capitalCase(brand)}` : brand,
        value: brand,
        default: brand === current,
      }))
    )
  );
}

export const EmojiDesignSelect = SelectMenuComponent({
  async handle(emojiCode: string) {
    const brand = this.values[0];

    await this.update({
      embeds: [new MessageEmbed(this.message.embeds[0]).setImage(emojiImg(emojiCode)[brand])],
      components: components(renderSelect(emojiCode, brand)),
    });
  },
});

export const AddEmojiButton = ButtonComponent({
  async handle(emojiString: string) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageEmojisAndStickers)) {
      return this.reply(CRBTError('You do not have permission to add emojis to this server.'));
    }

    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageEmojisAndStickers)) {
      return this.reply(CRBTError('I do not have permission to add emojis to this server.'));
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
        new MessageEmbed().setAuthor({
          iconURL: icons.success,
          name: `Successfully added :${emojiData.name}: to this server!`,
        }),
      ],
    });
  },
});
