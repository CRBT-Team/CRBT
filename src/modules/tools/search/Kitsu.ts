import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { SearchCmdOpts } from './search';

export async function handleKitsu(this: CommandInteraction, opts: SearchCmdOpts) {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${opts.query}`);

    const data: any = await res.json();
    const anime = data.data[0];

    // if (!anime) {
    //   return CRBTError(this, `No anime found with the title \`${title}\`.`);
    // }

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `Kitsu.io - Results for "${opts.query}"`,
            iconURL: 'https://cdn.clembs.xyz/C6PFAcn.png',
            url: 'https://kitsu.io',
          })
          .setTitle(anime.attributes.titles.en_jp)
          .setURL(`https://kitsu.io/anime/${anime.id}`)
          .setDescription(
            `**[Open in kitsu.io](https://kitsu.io/anime/${anime.id})**` +
            (anime.attributes.youtubeVideoId
              ? ` | **[Watch YouTube trailer](https://www.youtube.com/watch?v=${anime.attributes.youtubeVideoId})**`
              : '')
          )
          .addField(
            'Synopsis',
            anime.attributes.synopsis.length > 300
              ? anime.attributes.synopsis.substring(0, 300) + '...'
              : anime.attributes.synopsis
          )
          .addField(
            'Episodes',
            `${anime.attributes.episodeCount} (${anime.attributes.episodeLength} mins ${anime.attributes.episodeCount === 1 ? 'long' : 'each'
            })`,
            true
          )
          .addField('Type', anime.attributes.showType, true)
          .addField(
            'Rated',
            anime.attributes.ageRating +
            (anime.attributes.ageRatingGuide ? '\n' + anime.attributes.ageRatingGuide : ''),
            true
          )
          .addField(
            'Score',
            `${anime.attributes.averageRating}/100\nTop ${anime.attributes.ratingRank
            } on **[kitsu.io](https://kitsu.io)**\n${anime.attributes.favoritesCount} ${anime.attributes.favoritesCount === 1 ? 'favorite' : 'favorites'
            }`,
            true
          )
          .addField(
            anime.attributes.status === 'finished' ? 'Aired' : 'Airing',
            anime.attributes.status === 'finished'
              ? `From <t:${dayjs(anime.attributes.startDate).unix()}:D> to <t:${dayjs(
                anime.attributes.endDate
              ).unix()}:D>`
              : `Since <t:${dayjs(anime.attributes.startDate).unix()}> (ongoing)`,
            true
          )
          .setThumbnail(anime.attributes.posterImage.medium)
          .setColor(await getColor(this.user)),
      ],
    });
  } catch (error) {
    await this.reply(UnknownError(this, String(error)));
  }
}
