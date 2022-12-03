import { emojis } from '$lib/env';
import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';
import { createSearchResponse, fetchResults } from './_response';

export async function handleUrbanDictionary(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const { query, page } = opts;

  try {
    const req = (await fetchResults(this, opts, () =>
      fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURI(query)}`).then((r) =>
        r.json()
      )
    )) as any;

    const list = req.list;

    const pages = list?.length;
    const post = list[page - 1];

    if (!list || !post) {
      return createCRBTError(
        this,
        `Couldn't find the definition of \`${query}\`. Try again later.`
      );
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
            title: post.word,
            description: `**[${
              post.author
            }](https://www.urbandictionary.com/author.php/author=${encodeURIComponent(
              post.author
            )})** • ${emojis.thumbsup} **${post.thumbs_up}** ${emojis.thumbsdown} **${
              post.thumbs_down
            }**`,
            url: post.permalink,
            fields: [
              {
                name: 'Definition',
                value:
                  post.definition.length > 300
                    ? `${post.definition.replaceAll(/\[|\]/g, '').slice(0, 300)}...`
                    : post.definition.replaceAll(/\[|\]/g, ''),
              },
              ...(post.example
                ? [
                    {
                      name: 'Example',
                      value:
                        post.example.length > 300
                          ? `${post.example.replaceAll(/\[|\]/g, '').slice(0, 300)}...`
                          : post.example.replaceAll(/\[|\]/g, ''),
                    },
                  ]
                : []),
              {
                name: 'Written',
                value: `${timestampMention(new Date(post.written_on))}\n${timestampMention(
                  new Date(post.written_on),
                  'R'
                )}`,
                inline: true,
              },
            ],
            color: await getColor(this.user),
            footer: {
              text: `${t(this, 'POWERED_BY', {
                provider: searchEngines[opts.site].provider,
              })} • ${t(this, 'PAGINATION_PAGE_OUT_OF', {
                page: opts.page.toLocaleString(this.locale),
                pages: pages.toLocaleString(this.locale),
              })}`,
              icon_url: 'https://i.imgur.com/VWRSZiW.png',
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

export default ChatCommand({
  name: 'urban',
  description: 'Get the definition of a word from Urban Dictionary.',
  options: new OptionBuilder().string('word', 'The word to define.', { required: true }),
  async handle({ word }) {
    await this.deferReply();

    this.editReply(
      await handleUrbanDictionary.call(this, {
        anonymous: false,
        query: word,
        site: 'urban',
        page: 1,
        userId: this.user.id,
      })
    );
  },
});
