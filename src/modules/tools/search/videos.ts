import { UnknownError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { time } from '$lib/functions/time';
import dayjs from 'dayjs';
import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import { escapeMarkdown } from 'purplet';
import ytsr, { Video } from 'ytsr';
import { SearchCmdOpts } from './search';
import { createSearchResponse, fetchResults } from './_response';

export async function handleVideosSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  const { query, page } = opts;

  console.log('videos', opts);

  try {
    const req = await fetchResults(this, opts, () =>
      ytsr(query, {
        hl: this.locale.split('-')[0],
        gl: this.locale.split('-')[1] ?? null,
        safeSearch: this.channel.type === 'GUILD_TEXT' && this.channel.nsfw,
        limit: 12,
      })
    );

    const res = req.items.filter((i) => i.type === 'video') as Video[];
    const video = res[page - 1];
    const pages = res.length;

    return createSearchResponse(
      this,
      opts,
      {
        embeds: [
          {
            author: {
              name: `Video results for "${query}"`,
            },
            title: escapeMarkdown(video.title),
            url: video.url,
            description:
              video.description?.length > 150
                ? `${video.description.slice(0, 150)}...`
                : video.description,
            thumbnail: {
              url: video.author.bestAvatar.url,
            },
            image: {
              url: video.bestThumbnail.url,
            },
            fields: [
              {
                name: 'Uploaded',
                value: `${
                  video.uploadedAt
                    ? time(dayjs().subtract(ms(video.uploadedAt.replace('ago', ''))), true)
                    : 'At an unknown date'
                } by **[${video.author.name}](${video.author.url})**`,
              },
              {
                name: 'Views',
                value: video.views.toLocaleString(this.locale),
                inline: true,
              },
              {
                name: 'Duration',
                value: `\`${video.duration}\``,
                inline: true,
              },
            ],
            footer: {
              text: `Powered by YouTube • Page ${opts.page} out of ${pages} Results`,
              icon_url: `https://www.gstatic.com/youtube/img/branding/favicon/favicon_48x48.png`,
            },
          },
        ],
      },
      { pages }
    );
  } catch (e) {
    return UnknownError(this, e);
  }
}
