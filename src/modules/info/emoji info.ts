import { emojis, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { snowStamp } from '$lib/functions/snowStamp';
import { EmojiRegex } from '$lib/util/regex';
import { capitalCase } from 'change-case';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';
import emojiJSON from '../../../data/misc/emoji.json';

export default ChatCommand({
  name: 'emoji info',
  description: 'Get info on a given emoji.',
  options: new OptionBuilder().string(
    'emoji',
    'The emoji whose info to get. Works with custom emojis and standard Unicode emoji.',
    { required: true }
  ),
  async handle({ emoji }) {
    if (emoji.match(EmojiRegex)) {
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
        .replace(/ /g, '-')}`;
      // eye_1f441-fe0f.png
      const emojiImg = {
        google: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/313/${emojipediaCode}.png`,
        twitter: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/322/${emojipediaCode}.png`,
        facebook: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/facebook/304/${emojipediaCode}.png`,
        apple: `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160/${emojipediaCode}.png`,
        microsoft: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/310/${emojipediaCode}.png`,
      };

      const emojiURL = emojiImg.twitter;

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
            .addField(
              'Designs',
              Object.entries(emojiImg)
                .map(([brand, url]) => `**[${brand[0].toUpperCase() + brand.slice(1)}](${url})**`)
                .join(' | ')
            )
            .addField('Category', emojiData.category, true)
            .setImage(emojiURL)
            .setColor(await getColor(this.user)),
        ],
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
