import { emojis } from '$lib/env';
import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { trimURL } from '$lib/functions/trimURL';
import { t } from '$lib/language';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { SafeSearchType, search } from 'duck-duck-scrape';
import { decode } from 'html-entities';
import { escapeMarkdown } from 'purplet';
import { fetch } from 'undici';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';
import { createSearchResponse, fetchResults } from './_response';

export async function handleDuckDuckGo(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts,
) {
  const { query, page } = opts;

  try {
    const req = await fetchResults(this, opts, () =>
      search(query, {
        locale: this.locale,
        safeSearch:
          this.channel.type === 'GUILD_TEXT' && this.channel.nsfw
            ? SafeSearchType.OFF
            : SafeSearchType.STRICT,
      }),
    );

    let instantResultData: any;
    const res = req.results;

    const pages = Math.ceil(res.length / 3) - 1;

    if (page === 1) {
      try {
        instantResultData = await fetchResults<any>(this, opts, () =>
          fetch(
            `https://api.duckduckgo.com/?${new URLSearchParams({
              q: query,
              format: 'json',
            })}`,
          ).then((r) => r.json()),
        );

        if (instantResultData && instantResultData.Abstract && instantResultData.meta?.status) {
          return handleDDGInstant.call(this, opts, instantResultData, pages);
        } else {
          instantResultData = null;
        }
      } catch (e) {}
    }

    const realPage = instantResultData ? opts.page + 1 : opts.page;

    if (req.noResults || res.length === 0) {
      return createCRBTError(this, {
        title: t(this, 'SEARCH_ERROR_NO_RESULTS_TITLE'),
        description: t(this, 'SEARCH_ERROR_NO_RESULTS_DESCRIPTION'),
      });
    }

    return createSearchResponse(
      this,
      opts,
      {
        embeds: [
          {
            title: t(this, 'SEARCH_TITLE', {
              engine: t(this, `SEARCH_ENGINES.${opts.site}` as any),
              query,
            }),
            url: `https://duckduckgo.com/?q=${encodeURI(query)}`,
            fields: res.slice(realPage * 3, realPage * 3 + 3).map((result) => {
              const name = escapeMarkdown(decode(result.title));
              const url = `${result.url.startsWith('https') ? emojis.lock : ''} **[${trimURL(
                escapeMarkdown(result.url),
              )
                .replace(/\//g, ' › ')
                .replace(/\\/g, '')}](${result.url})**`;
              const desc = result.description.replace(/<\/?b>/gi, '**').slice(0, 150);

              return {
                name,
                value: `${url}\n${desc}...`,
              };
            }),
            footer: {
              text: `${t(this, 'POWERED_BY', {
                provider: searchEngines[opts.site].provider,
              })} • ${t(this, 'PAGINATION_MULTIPLE_RESULTS', {
                resultsPerPage: '3',
                results: res.length.toLocaleString(this.locale),
              })} (${t(this, 'PAGINATION_PAGE_OUT_OF', {
                page: opts.page.toLocaleString(this.locale),
                pages: (instantResultData ? pages + 1 : pages).toLocaleString(this.locale),
              })})`,
              iconURL: `https://duckduckgo.com/favicon.png`,
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

export async function handleDDGInstant(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts,
  data: any,
  pages: number,
) {
  const { query } = opts;

  return createSearchResponse(
    this,
    opts,
    {
      embeds: [
        {
          author: {
            name: `Instant result for "${query}"`,
            url: `https://duckduckgo.com/?q=${encodeURI(query)}`,
          },
          title: data.Heading,
          url: data.AbstractURL,
          description:
            data.AbstractText.length > 250
              ? `${data.AbstractText.slice(0, 250)}...`
              : data.AbstractText,
          thumbnail: {
            url: data.Image ? `https://duckduckgo.com${data.Image}` : null,
          },
          fields: data.Infobox?.content
            ?.filter((field) => field && typeof field.value === 'string')
            ?.slice(0, 3)
            ?.map((field) => ({
              name: field.label,
              value: field.value,
              inline: true,
            })),
          footer: {
            text: `Source: ${data.AbstractSource}\nPowered by DuckDuckGo • Showing Instant Result (Page 1/${pages})`,
            iconURL: `https://duckduckgo.com/favicon.png`,
          },
        },
      ],
    },
    { pages },
  );
}
