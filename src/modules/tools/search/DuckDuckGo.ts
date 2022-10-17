import { emojis } from '$lib/env';
import { UnknownError } from '$lib/functions/CRBTError';
import { trimURL } from '$lib/functions/trimURL';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { SafeSearchType, search } from 'duck-duck-scrape';
import { escapeMarkdown } from 'purplet';
import { SearchCmdOpts } from './search';
import { createSearchResponse } from './_response';

export async function handleDuckDuckGo(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const { query } = opts;

  try {
    const req = await search(query, {
      locale: this.locale,
      safeSearch:
        this.channel.type === 'GUILD_TEXT' && this.channel.nsfw
          ? SafeSearchType.OFF
          : SafeSearchType.STRICT,
    });

    if (req.noResults) {
      return {
        content: 'no results :pleading_face:',
      };
    }

    const res = req.results;

    return createSearchResponse(this, opts, {
      embeds: [
        {
          title: `Web results for "${query}"`,
          url: `https://duckduckgo.com/?q=${encodeURI(query)}`,
          fields: res.slice(0, 3).map((result) => {
            const name = result.title;
            const url = `${result.url.startsWith('https') ? emojis.lock : ''} **[${trimURL(
              escapeMarkdown(result.url)
            ).replace(/\//g, ' › ')}](${result.url})**`;
            const desc = result.description.replace(/<\/?b>/gi, '**').slice(0, 150);

            return {
              name,
              value: `${url}\n${desc}...`,
            };
          }),
          footer: {
            text: `Powered by DuckDuckGo • Showing 3 out of ${
              res.length
            } Results (Page 1/${Math.round(res.length / 3)})`,
            iconURL: `https://duckduckgo.com/favicon.png`,
          },
        },
      ],
    });
  } catch (e) {
    this.reply(UnknownError(this, e));
  }
}
