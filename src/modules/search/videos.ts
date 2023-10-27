import { UnknownError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import { escapeMarkdown } from 'purplet';
import ytsr, { Video } from 'ytsr';
import { searchEngines } from './_engines';
import { createSearchResponse, fetchResults } from './_response';
import { SearchCmdOpts } from './search';

export async function handleVideosSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts,
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  const { query, page } = opts;

  try {
    const req = await fetchResults(this, opts, () =>
      ytsr(query, {
        hl: this.locale.split('-')[0],
        gl: this.locale.split('-')[1] ?? null,
        safeSearch: this.channel.type === 'GUILD_TEXT' && this.channel.nsfw,
        limit: 12,
      }),
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
              name: t(this, 'SEARCH_TITLE', {
                engine: t(this, `SEARCH_ENGINES.${opts.site}` as any),
                query,
              }),
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
                name: t(this, 'CREATED_ON'),
                value: `${
                  video.uploadedAt
                    ? timestampMention(
                        dayjs().subtract(ms(video.uploadedAt.replace('ago', ''))),
                        'R',
                      )
                    : '??'
                } • **[${video.author.name}](${video.author.url})**`,
              },
              {
                name: t(this, 'VIEWS'),
                value: video.views.toLocaleString(this.locale),
                inline: true,
              },
              {
                name: t(this, 'DURATION'),
                value: `\`${video.duration}\``,
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
