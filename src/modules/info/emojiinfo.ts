import { CRBTError } from '$lib/functions/CRBTError';
import { getVar } from '$lib/functions/getVar';
import { snowStamp } from '$lib/functions/snowStamp';
import { toTitleCase } from '$lib/functions/toTitleCase';
import { EmojiRegex } from '$lib/util/regex';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import emojiJSON from '../../../data/misc/emoji.json';

export default ChatCommand({
  name: 'emojiinfo',
  description: 'Returns information about a given emoji.',
  options: new OptionBuilder().string('emoji', 'The emoji to get information about.', true),
  async handle({ emoji }) {
    if (emoji.match(EmojiRegex)) {
      // const eArray = new Collection();
      // for (const guild of this.client.guilds.cache.values()) {
      //   const server = await guild.fetch();
      //   for (const emoji of (await server.emojis.fetch()).values()) {
      //     eArray.set(emoji.toString(), emoji);
      //   }
      // }
      // console.log(eArray);
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
            .setAuthor(`${emojiData.name} - Emoji info`, emojiData.url)
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
            .setColor(`#${await getVar('color', this.user.id)}`),
        ],
      });
    } else if (emojiJSON.find((e) => e.char === emoji)) {
      const emojiData = emojiJSON.find((e) => e.char === emoji);
      const emojiUni = emojiData.codes.replaceAll(' ', '-').toLowerCase();

      const emojiImg = {
        google: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/313/${emojiData.name.replaceAll(
          ' ',
          '-'
        )}_${emojiUni}.png`,
        twitter: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/${emojiData.name.replaceAll(
          ' ',
          '-'
        )}_${emojiUni}.png`,
        meta: `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-facebook-96/${emojiUni}.png`,
        apple: `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160/${emojiUni}.png`,
        microsoft: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/310/${emojiData.name.replaceAll(
          ' ',
          '-'
        )}_${emojiUni}.png`,
      };

      const emojiURL = emojiData.unicode === '14.0' ? emojiImg.google : emojiImg.twitter;

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor(`${toTitleCase(emojiData.name)} - Emoji info`, emojiURL)
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
            .setColor(`#${await getVar('color', this.user.id)}`),
        ],
      });
    } else {
      await this.reply(CRBTError('This emoji doesnt exist'));
    }
  },
});
