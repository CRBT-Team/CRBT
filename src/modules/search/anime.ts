import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { createLinkButton, timestampMention } from '@purplet/utils';
import { capitalCase } from 'change-case-all';
import { CommandInteraction, EmbedFieldData, MessageComponentInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { components, row } from 'purplet';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';
import { createSearchResponse, fetchResults } from './_response';

export async function handleAnimeMangas(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const { query } = opts;

  const gql = `
  query($search: String) {
    Page(page: 1, perPage: 10) {
      pageInfo {
        total
        perPage
      }
      media(search: $search, isAdult: false) {
        id
        title {
          romaji
        }
        type
        description
        type
        duration
        episodes
        chapters
        format
        bannerImage
        coverImage {
          large
          color
        }
        endDate {
          year
          month
          day
        }
        startDate {
          year
          month
          day
        }
        genres
        nextAiringEpisode {
          episode
          airingAt
        }  
        externalLinks {
          url
          notes
          isDisabled
          site
          type
        }
      }
    }
  }
  `;

  try {
    const res: any = await fetchResults(this, opts, () =>
      fetch(`https://graphql.anilist.co`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: gql,
          variables: {
            search: query,
          },
        }),
      }).then((r) => r.json())
    );

    if (!res || res.errors || !res.data || res.data.Page.media.length === 0) {
      return createCRBTError(this, `No anime found with this title.`);
    }

    const result = res.data.Page.media[opts.page - 1];
    const pages = res.data.Page.pageInfo.total < 10 ? res.data.Page.pageInfo.total : 10;

    const fields: EmbedFieldData[] = [];

    if (result.startDate) {
      const strings = {
        MANGAtrue: 'Released',
        MANGAfalse: 'First release',
        ANIMEtrue: 'Aired',
        ANIMEfalse: 'Airing',
      };

      const startDate = new Date(
        result.startDate.year,
        result.startDate.month - 1,
        result.startDate.day
      );
      const endDate = result.endDate.year
        ? new Date(result.endDate.year, result.endDate.month - 1, result.endDate.day)
        : null;
      const isOver = !result.nextAiringEpisode?.airingAt && endDate instanceof Date;

      fields.push({
        name: strings[`${result.type}${isOver}`],
        value: isOver
          ? `From ${timestampMention(startDate, 'd')} to ${timestampMention(endDate, 'd')}`
          : `${timestampMention(startDate, 'D')}` +
            (result.nextAiringEpisode?.airingAt
              ? `• Episode ${result.nextAiringEpisode.episode} ${timestampMention(
                  result.nextAiringEpisode.airingAt * 1000,
                  'R'
                )}`
              : ''),
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
              url: 'https://anilist.co',
            },
            title: `${result.title.romaji} (${capitalCase(result.type)})`,
            url: `https://anilist.co/anime/${result.id}/`,
            description:
              result.description?.length > 150
                ? `${result.description?.slice(0, 150)}...`
                : result.description,
            thumbnail: result.coverImage ? { url: result.coverImage.large } : null,
            image: result.bannerImage ? { url: result.bannerImage } : null,
            color: result.coverImage.color
              ? parseInt(result.coverImage.color.replace('#', ''), 16)
              : null,
            fields: [
              {
                name: 'Genres',
                value: result.genres
                  .map((g) => `[\`${g}\`](https://anilist.co/search/anime/${encodeURI(g)})`)
                  .join(' '),
              },
              ...fields,
            ],
            footer: {
              text: `${t(this, 'POWERED_BY', {
                provider: searchEngines[opts.site].provider,
              })} • ${t(this, 'PAGINATION_PAGE_OUT_OF', {
                page: opts.page.toLocaleString(this.locale),
                pages: pages.toLocaleString(this.locale),
              })}`,
              icon_url: `https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/AniList_logo.svg/240px-AniList_logo.svg.png`,
            },
            // .addField(
            //   'Episodes',
            //   `${anime.attributes.episodeCount} (${anime.attributes.episodeLength} mins ${
            //     anime.attributes.episodeCount === 1 ? 'long' : 'each'
            //   })`,
            //   true
            // )
            // .addField('Type', anime.attributes.showType, true)
            // .addField(
            //   'Rated',
            //     anime.attributes.ageRating +
            //       (anime.attributes.ageRatingGuide ? '\n' + anime.attributes.ageRatingGuide : ''),
            //     true
            //   )
            //   .addField(
            //     'Score',
            //     `${anime.attributes.averageRating}/100\nTop ${
            //       anime.attributes.ratingRank
            //     } on **[kitsu.io](https://kitsu.io)**\n${anime.attributes.favoritesCount} ${
            //       anime.attributes.favoritesCount === 1 ? 'favorite' : 'favorites'
            //     }`,
            //     true
            //   )
            //   .addField(
            //     anime.attributes.status === 'finished' ? 'Aired' : 'Airing',
            //     anime.attributes.status === 'finished'
            //       ? `From <t:${dayjs(anime.attributes.startDate).unix()}:D> to <t:${dayjs(
            //           anime.attributes.endDate
            //         ).unix()}:D>`
            //       : `Since <t:${dayjs(anime.attributes.startDate).unix()}> (ongoing)`,
            //     true
            //   )
          },
        ],
        components:
          result.externalLinks.length > 1
            ? components(
                row(
                  result.externalLinks
                    .slice(0, 3)
                    .map(({ url, site }) => createLinkButton(site, url))
                )
              )
            : null,
      },
      { pages }
    );
  } catch (e) {
    return UnknownError(this, e);
  }
}
