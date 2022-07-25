import { emojis } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'urban',
  description: 'Get the definition of a word from Urban Dictionary.',
  options: new OptionBuilder().string('word', 'The word to define.', { required: true }),
  async handle({ word }) {
    try {
      const req = await fetch(`https://api.urbandictionary.com/v0/define?term=${word}`);

      const post = ((await req.json()) as any).list[0];

      if (!post) {
        return this.reply(
          CRBTError(`Couldn't find the definition of \`${word}\`. Try again later.`)
        );
      }

      const e = new MessageEmbed()
        .setAuthor({
          name: `${post.word} - Urban Dictionary definition`,
          iconURL: 'https://cdn.clembs.xyz/VWRSZiW.png',
        })
        .setDescription(`**[Open in Urban Dictionary](${post.permalink})**`)
        .addField(
          'Definition',
          post.definition.length > 300
            ? `${post.definition.replaceAll(/\[|\]/g, '').slice(0, 300)}...`
            : post.definition.replaceAll(/\[|\]/g, '')
        )
        .addField(
          'Example',
          post.example.length > 300
            ? `${post.example.replaceAll(/\[|\]/g, '').slice(0, 300)}...`
            : post.example.replaceAll(/\[|\]/g, '')
        )
        .addField(
          'Author',
          `**[${
            post.author
          }](https://www.urbandictionary.com/author.pho/author=${encodeURIComponent(
            post.author
          )})**`,
          true
        )
        .addField(
          'Written',
          `<t:${dayjs(post.written_on).unix()}>\n(<t:${dayjs(post.written_on).unix()}:R>)`,
          true
        )
        .addField(
          'Votes',
          `${emojis.thumbsup} **${post.thumbs_up}** | ${emojis.thumbsdown} **${post.thumbs_down}**`,
          true
        )
        .setColor(await getColor(this.user))
        .setFooter({ text: 'Powered by Urban Dictionary' });

      await this.reply({ embeds: [e] });
    } catch (error) {
      await this.reply(UnknownError(this, String(error)));
    }
  },
});
