import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { Anime } from '$lib/types/apis/kitsuio';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'anime',
  description: 'Search anime information from kitsu.io.',
  options: new OptionBuilder().string(
    'title',
    'The title of the anime you want to search for.',
    true
  ),
  async handle({ title }) {
    try {
      const res = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${title}`);

      const data = (await res.json()) as Anime;
      const anime = data.data[0];

      if (!anime) {
        return this.reply(CRBTError(`No anime found with the title \`${title}\`.`));
      }

      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${anime.attributes.titles.en_jp} - Anime info`,
              iconURL: 'https://cdn.clembs.xyz/C6PFAcn.png',
              url: `https://kitsu.io/anime/${anime.id}`,
            })
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
              `${anime.attributes.episodeCount} (${anime.attributes.episodeLength} mins ${
                anime.attributes.episodeCount === 1 ? 'long' : 'each'
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
              `${anime.attributes.averageRating}/100\nTop ${
                anime.attributes.ratingRank
              } on **[kitsu.io](https://kitsu.io)**\n${anime.attributes.favoritesCount} ${
                anime.attributes.favoritesCount === 1 ? 'favorite' : 'favorites'
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
            .setColor(await getColor(this.user))
            .setFooter({ text: 'Source: kitsu.io' }),
        ],
      });
    } catch (error) {
      await this.reply(UnknownError(this, String(error)));
    }
  },
});
