import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { snowStamp } from '$lib/functions/snowStamp';
import { EmojiRegex } from '$lib/util/regex';
import { capitalCase } from 'change-case';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
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

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: `${emojiData.name} - Emoji info`, iconURL: emojiData.url })
            .addField(
              'Resolutions (in pixels)',
              [1024, 512, 256, 128].map((r) => `**[${r}](${emojiData.url}?size=${r})**`).join(' | ')
            )
            .addField('ID', emojiData.id)
            .addField('Animated', emojiData.animated ? 'Yes' : 'No')
            .addField(
              'Added',
              `<t:${emojiData.createdAt.unix()}> (<t:${emojiData.createdAt.unix()}:R>)`
            )
            .setImage(emojiData.url)
            .setColor(await getColor(this.user)),
        ],
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
