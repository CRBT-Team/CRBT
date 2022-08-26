import { emojis } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { trimURL } from '$lib/functions/trimURL';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SafeSearchType, search } from 'duck-duck-scrape';
import { SearchCmdOpts } from './search';

export async function handleDuckDuckGo(this: CommandInteraction, opts: SearchCmdOpts) {
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
      return this.reply(CRBTError(`No search results found for ${query}!`));
    }

    const res = req.results;

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `DuckDuckGo - Results for "${query}"`,
            iconURL: `https://duckduckgo.com/favicon.png`,
            url: 'https://duckduckgo.com',
          })
          .setFields(
            res.slice(0, 3).map((result) => {
              const name = decodeURI(result.title);
              const url = `${result.url.startsWith('https') ? emojis.lock : ''} **[${trimURL(
                result.url
              ).replace(/\//g, ' › ')}](${result.url})**`;
              const desc = result.description.replace(/<\/?b>/gi, '**').slice(0, 150);

              return {
                name,
                value: `${url}\n${desc}...`,
              };
            })
          )
          .setFooter({
            text: `Showing 3 out of ${res.length} Results (Page 1/${res.length})`,
          })
          .setColor(await getColor(this.user)),
      ],
      ephemeral: opts.anonymous,
    });
  } catch (e) {
    this.reply(UnknownError(this, e));
  }
}
