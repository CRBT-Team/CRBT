import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { Interaction, MessageEmbed, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';
import { xml2js } from 'xml-js';
import { Yamlr34 } from '../../lib/types/apis/rule34xxx';

export default ChatCommand({
  name: 'nsfw rule34',
  description: 'Get a random image from rule34 (Not Safe For Work).',
  options: new OptionBuilder()
    .string('include_tags', 'The tags to search for (seperated by a comma).', true)
    .string('exclude_tags', 'The tags to exclude (seperated by a comma).')
    .boolean('safe_only', 'Whether to only search for SFW images.')
    .boolean('incognito', 'Whether to send message publicly.'),
  async handle({ include_tags, exclude_tags, safe_only, incognito }) {
    if (!(this.channel as TextChannel).nsfw) {
      return this.reply(CRBTError(this, 'This command can only be used in NSFW channels.'));
    }

    const allTags = ['sort:updated:desc'];

    include_tags.split(',').forEach((tag) => allTags.push(tag.trim().replaceAll(' ', '_')));

    if (exclude_tags) {
      exclude_tags.split(',').forEach((tag) => allTags.push('-' + tag.trim().replaceAll(' ', '_')));
    }

    if (safe_only) {
      allTags.push('rating:safe');
    }

    await this.reply(Object.assign(await loadImg(allTags, 0, this), { ephemeral: incognito }));
  },
});

export const Refresh = ButtonComponent({
  async handle(opts: { tags: string[]; index: number }) {
    console.log(opts.index);
    return this.update(await loadImg(opts.tags, opts.index, this));
  },
});

const loadImg = async (tags: string[], index: number, i: Interaction) => {
  console.log(index);

  try {
    const req = await fetch(
      'https://api.rule34.xxx/index.php?' +
        new URLSearchParams({
          page: 'dapi',
          s: 'post',
          q: 'index',
          tags: tags.join(' '),
          limit: '15',
        })
    );

    if (req.status !== 200) {
      return CRBTError(null, "Invalid tags. Make sure they're valid and try again.");
    }

    const xml = xml2js(await req.text(), {
      compact: true,
    }) as Yamlr34;

    const postsLength = xml.posts.post.length;
    const { _attributes: post } =
      postsLength < index + 1 ? xml.posts.post[0] : xml.posts.post[index];

    return {
      content: index.toString(),
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
          .setColor(await getColor(i.user))
          .setImage(post.sample_url),
      ],
      components: components(
        row(
          new Refresh({ tags, index: index - 1 })
            .setStyle('SECONDARY')
            .setLabel('Previous image')
            .setDisabled(index === 0),
          new Refresh({ tags, index: index + 1 })
            .setStyle('SECONDARY')
            .setLabel('Next image')
            .setDisabled(index === postsLength)
        )
      ),
    };
  } catch (e) {
    return CRBTError(null, 'An error occured while trying to get the image.');
  }
};
