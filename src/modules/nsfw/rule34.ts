import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { MessageEmbed, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';
import { xml2js } from 'xml-js';
import { Yamlr34 } from '../../lib/types/apis/rule34xxx';

export default ChatCommand({
  name: 'nsfw rule34',
  description: 'Get a random image from rule34 (Not Safe For Work).',
  options: new OptionBuilder()
    .string('include_tags', 'The tags to search for (seperated by a comma).', true)
    .string('exclude_tags', 'The tags to exclude (seperated by a comma).')
    .boolean('safe_only', 'Whether to only search for SFW images.'),
  async handle({ include_tags, exclude_tags, safe_only }) {
    if (!(this.channel as TextChannel).nsfw) {
      return this.reply(CRBTError(this, 'This command can only be used in NSFW channels.'));
    }

    await this.deferReply();

    const allTags = ['sort:updated:desc'];

    include_tags.split(',').forEach((tag) => allTags.push(tag.trim().replaceAll(' ', '_')));

    if (exclude_tags) {
      exclude_tags.split(',').forEach((tag) => allTags.push('-' + tag.trim().replaceAll(' ', '_')));
    }

    if (safe_only) {
      allTags.push('rating:safe');
    }

    const req = await fetch(
      'https://rule34.xxx/index.php?' +
        new URLSearchParams({
          page: 'dapi',
          s: 'post',
          q: 'index',
          tags: allTags.join(' '),
          limit: '15',
        })
    );

    if (req.status !== 200) {
      return this.reply(CRBTError(this, "Invalid tags. Make sure they're valid and try again."));
    }

    const xml = xml2js(await req.text(), {
      compact: true,
    }) as Yamlr34;

    const post = xml.posts.post[Math.floor(Math.random() * xml.posts.post.length)]._attributes;

    // console.log(post);

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'Rule 34 - Results', iconURL: 'https://rule34.xxx/favicon.png' })
          .setDescription(
            `**[View original](${post.file_url})** | **[Open in rule34.xxx](https://rule34.xxx/index.php?page=post&s=view&id=${post.id})**` +
              (post.source ? ` | **[Source](${post.source})**` : '') +
              (post.creator_id
                ? ` | **[Poster URL](https://rule34.xxx/index.php?page=account&s=profile&id=${post.creator_id})**`
                : '')
          )
          .addField(
            'Tags',
            post.tags.length > 10
              ? `\`\`\`\n${post.tags
                  .split(' ')
                  .slice(1, post.tags.split(' ').length - 1)
                  .join(', ')}\`\`\``
              : `\`\`\`\n${post.tags.split(' ').slice(1, 10).join(', ')} \`\`\``
          )
          .addField(
            'Created on',
            `<t:${dayjs(post.created_at).unix()}> (<t:${dayjs(post.created_at).unix()}:R>)`,
            true
          )
          .addField('Score', post.score, true)
          .setColor(await getColor(this.user))
          .setImage(post.sample_url),
      ],
    });
  },
});
