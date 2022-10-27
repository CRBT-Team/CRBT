import { UnknownError } from '$lib/functions/CRBTError';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { image as imageSearch } from 'googlethis';
import { SearchCmdOpts } from './search';
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
        safe: !(this.channel.type === 'GUILD_TEXT' && this.channel.nsfw),
      })
    );

    const image = res[opts.page - 1];
    const pages = res.length;

    console.log('images', opts);

    return createSearchResponse(
      this,
      opts,
      {
        embeds: [
          {
            author: {
              name: `Image results for "${query}"`,
            },
            title: image.origin?.title,
            url: image.origin?.website.url,
            image: {
              url: image.url,
            },
            footer: {
              text: `Powered by Google Images • Page ${opts.page} out of ${pages} Results`,
              iconURL: `https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png`,
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
