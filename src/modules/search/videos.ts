import { UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { youtube } from '@googleapis/youtube';
import { timestampMention } from '@purplet/utils';
import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import { escapeMarkdown } from 'purplet';
import { searchEngines } from './_engines';
import { createSearchResponse, fetchResults } from './_response';
import { SearchCmdOpts } from './search';

export async function handleVideosSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts,
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  const { query, page } = opts;
  const yt = youtube('v3');

  try {
    const req = await fetchResults(
      this,
      opts,
      async () =>
        await yt.search
          .list({
            q: query,
            key: process.env.YOUTUBE_API_KEY,
            part: ['snippet'],
            maxResults: 12,
            type: ['video'],
            safeSearch:
              this.channel.type === 'GUILD_TEXT' && this.channel.nsfw ? 'none' : 'moderate',
          })
          .then(async (res) => {
            // fetch and append video contentDetails and statistics
            const ids = res.data.items.map((i) => i.id.videoId);

            return await yt.videos.list({
              key: process.env.YOUTUBE_API_KEY,
              part: ['snippet', 'contentDetails', 'statistics'],
              id: ids,
            });
          }),

      // ytsr(query, {
      //     hl: this.locale.split('-')[0],
      //     gl: this.locale.split('-')[1] ?? null,
      //     safeSearch: this.channel.type === 'GUILD_TEXT' && this.channel.nsfw,
      //     limit: 12,
      //   }),
    );

    const res = req.data.items;
    const video = res[page - 1];
    const pages = res.length;

    return createSearchResponse(
      this,
      opts,
      {
        embeds: [
          {
            author: {
              name: t(this, 'SEARCH_TITLE', {
                engine: t(this, `SEARCH_ENGINES.${opts.site}` as any),
                query,
              }),
            },
            title: escapeMarkdown(video.snippet.title),
            url: `https://www.youtube.com/watch?v=${video.id}`,
            description:
              video.snippet.description?.length > 150
                ? `${video.snippet.description.slice(0, 150)}...`
                : video.snippet.description,
            image: {
              url: video.snippet.thumbnails.high.url,
            },
            fields: [
              {
                name: t(this, 'CREATED_ON'),
                value: `${
                  video.snippet.publishedAt
                    ? timestampMention(new Date(video.snippet.publishedAt).getTime(), 'R')
                    : '??'
                } • **[${video.snippet.channelTitle}](https://www.youtube.com/channel/${
                  video.snippet.channelId
                })**`,
              },
              {
                name: t(this, 'VIEWS'),
                value: Number(video.statistics.viewCount).toLocaleString(this.locale),
                inline: true,
              },
              {
                name: t(this, 'DURATION'),
                value: video.contentDetails.duration.replace('PT', '').toLowerCase(),
                inline: true,
              },
            ],
            footer: {
              text: `${t(this, 'POWERED_BY', {
                provider: searchEngines[opts.site].provider,
              })} • ${t(this, 'PAGINATION_PAGE_OUT_OF', {
                page: opts.page.toLocaleString(this.locale),
                pages: pages.toLocaleString(this.locale),
              })}`,
              icon_url: `https://www.gstatic.com/youtube/img/branding/favicon/favicon_48x48.png`,
            },
          },
        ],
      },
      { pages },
    );
  } catch (e) {
    return UnknownError(this, e);
  }
}
