import { time } from '$lib/functions/time';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ListGameRaw } from 'rawg-api-sdk';
import { ListGamesParams } from 'rawg-api-sdk/dist/src/typings/games';
import { SearchCmdOpts } from './search';

export async function handleRAWG(this: CommandInteraction, opts: SearchCmdOpts) {
  const { query } = opts;

  const url = `https://api.rawg.io/api/games?${new URLSearchParams({
    key: process.env.RAWG_TOKEN!,
    page_size: '1',
    search: query,
  })}`;

  const res = await fetch(url).then((r) => r.json()) as { results: ListGameRaw[] };

  const game = res.results[0];

  this.reply({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `RAWG.io - Results for "${query}"`,
          iconURL: 'https://rawg.io/favicon.ico'
        })
        .setTitle(game.name)
        .addFields([
          {
            name: 'Platforms',
            value: game.platforms.map((p) => p.platform.name).join(', ')
          },
          {
            name: 'Release date',
            value: `${time(new Date(game.released), 'D')} • ${time(new Date(game.released), true)}`,
          },
          {
            name: 'Ratings',
            value: `**${game?.rating}/5** (${game.ratings_count} user ratings) on [RAWG.io](https://rawg.io)\n**${game.metacritic}** on [Metacritic](https://metacritic.com)`,
            inline: true
          },
          {
            name: 'ESRB Rating',
            value: game.esrb_rating?.name ?? 'Unrated',
            inline: true
          },
          {
            name: 'Tags',
            value: game.tags.slice(0, 10).map((tag) => `\`${tag.name}\``).join(' ')
          },
          {
            name: 'Genres',
            value: game.genres.map((genre) => `\`${genre.name}\``).join(' ')
          }
        ])
        .setColor(parseInt(game.dominant_color, 16))
        .setImage(game.background_image)
    ],
    files: [new MessageAttachment(Buffer.from(JSON.stringify(res, null, 2)), 'res.json')],
    ephemeral: opts.anonymous
  });
}
