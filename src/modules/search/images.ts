import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { image as imageSearch } from 'googlethis';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';
import { createSearchResponse, fetchResults } from './_response';

export async function handleImageSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const { query } = opts;

  try {
    const res = await fetchResults(this, opts, () =>
      imageSearch(query, {
        additional_params: {},
        safe: 'nsfw' in this.channel ? !this.channel.nsfw : true,
      })
    );

    const image = res[opts.page - 1];
    const pages = res.length;

    if (!pages) {
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
            author: {
              name: t(this, 'SEARCH_TITLE', {
                engine: t(this, `SEARCH_ENGINES.${opts.site}` as any),
                query,
              }),
            },
            title: image.origin?.title,
            url: image.origin?.website.url,
            image: {
              url: image.url,
            },
            footer: {
              text: `${t(this, 'POWERED_BY', {
                provider: searchEngines[opts.site].provider,
              })} • ${t(this, 'PAGINATION_PAGE_OUT_OF', {
                page: opts.page.toLocaleString(this.locale),
                pages: pages.toLocaleString(this.locale),
              })}`,
              icon_url: `https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png`,
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
