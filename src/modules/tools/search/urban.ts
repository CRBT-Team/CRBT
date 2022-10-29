import { emojis } from '$lib/env';
import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { timestampMention } from '@purplet/utils';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { SearchCmdOpts } from './search';
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
              name: `Urban Dictionary search for "${query}"`,
            },
            title: post.word,
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
                name: 'Author',
                value: `**[${
                  post.author
                }](https://www.urbandictionary.com/author.pho/author=${encodeURIComponent(
                  post.author
                )})**`,
                inline: true,
              },
              {
                name: 'Votes',
                value: `${emojis.thumbsup} **${post.thumbs_up}** • ${emojis.thumbsdown} **${post.thumbs_down}**`,
                inline: true,
              },
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
              text: `Powered by Urban Dictionary • Page ${page} out of ${pages} results`,
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
