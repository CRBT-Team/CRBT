// import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
// import { getColor } from '$lib/functions/getColor';
// import { capitalCase } from 'change-case-all';
// import dayjs from 'dayjs';
// import { MessageEmbed } from 'discord.js';
// import fetch from 'node-fetch';
// import { ChatCommand, OptionBuilder } from 'purplet';
// import { Manga } from '../../lib/types/apis/mangadex';

// export default ChatCommand({
//   name: 'manga',
//   description: 'Search manga information from MangaDex.',
//   options: new OptionBuilder().string(
//     'title',
//     'The title of the manga you want to search for.',
//     true
//   ),
//   async handle({ title }) {
//     try {
//       const res = await fetch(`https://api.mangadex.org/manga?title=${title}`);

//       const data = (await res.json()) as Manga;
//       const manga = data.data.filter(
//         (manga) =>
//           !manga.attributes.tags.find((tag) => tag.attributes.name.en === 'Doujinshi') &&
//           manga.type === 'manga'
//       )[0];

//       if (!manga) {
//         return CRBTError(this, `No manga found with the title \`${title}\`.`);
//       }

//       const attr = manga.attributes;
//       const urls = Object.entries(attr.links).filter(([, link]) =>
//         link.match(
//           /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
//         )
//       );
//       enum shortLinkNames {
//         amz = 'Buy on Amazon',
//         raw = 'Read Official Raw',
//         cdj = 'Read on CDJapan',
//         ebj = 'Read on eBookJapan',
//         engtl = 'Official English Translation',
//       }
//       const author: any = await fetch(
//         `https://api.mangadex.org/author/${manga.relationships.find((r) => r.type === 'author').id}`
//       ).then((res) => res.json());

//       this.reply({
//         embeds: [
//           new MessageEmbed()
//             .setAuthor({
//               name: `${attr.title.en} - Manga info`,
//               iconURL: 'https://cdn.clembs.xyz/6J6zGxK.png',
//               url: `https://mangadex.org/title/${manga.id}`,
//             })
//             .setDescription(
//               `**[Open in MangaDex](https://mangadex.org/title/${manga.id})**` +
//                 (attr.links.mal
//                   ? ` | **[Open on MAL](https://myanimelist.net/anime/${attr.links.mal})**`
//                   : '') +
//                 (attr.links.ks
//                   ? ` | **[Open on kitsu.io](https://kitsu.io/${attr.links.ks})**`
//                   : '') +
//                 (attr.links.bw
//                   ? ` | **[Buy on Book☆Walker](https://bookwalker.jp/${attr.links.bw})**`
//                   : '') +
//                 urls
//                   .map(([prov, link]) =>
//                     shortLinkNames[prov] ? ` | **[${shortLinkNames[prov]}](${link})**` : ''
//                   )
//                   .join('')
//             )
//             .addField(
//               'Description',
//               attr.description.en.split('---')[0].trim().length > 300
//                 ? attr.description.en.split('---')[0].trim().substring(0, 300) + '...'
//                 : attr.description.en.split('---')[0].trim()
//             )
//             .addField(
//               'Author',
//               `**[${author.data.attributes.name}](https://mangadex.org/author/${author.data.id})**`,
//               true
//             )
//             .addField(
//               'Genres',
//               attr.tags.filter((tag) => tag.attributes.group === 'genre').length > 0
//                 ? attr.tags
//                     .filter((tag) => tag.attributes.group === 'genre')
//                     .map(
//                       (tag) => `**[${tag.attributes.name.en}](https://mangadex.org/tag/${tag.id})**`
//                     )
//                     .join(', ')
//                 : 'None',
//               true
//             )
//             .addField(
//               'Themes',
//               attr.tags.filter((tag) => tag.attributes.group === 'theme').length > 0
//                 ? attr.tags
//                     .filter((tag) => tag.attributes.group === 'theme')
//                     .map(
//                       (tag) => `**[${tag.attributes.name.en}](https://mangadex.org/tag/${tag.id})**`
//                     )
//                     .join(', ')
//                 : 'None',
//               true
//             )
//             .addField(
//               'Demographic',
//               attr.publicationDemographic ? capitalCase(attr.publicationDemographic) : 'Unknown',
//               true
//             )
//             .addField('Chapters', attr.status === 'ongoing' ? `Ongoing` : attr.lastChapter, true)
//             .addField(
//               'Rating',
//               attr.contentRating ? capitalCase(attr.contentRating) : 'Unrated',
//               true
//             )
//             .addField('Created at', ` <t:${dayjs(attr.createdAt).unix()}>`, true)
//             .addField('Updated at', ` <t:${dayjs(attr.updatedAt).unix()}>`, true)
//             // .setThumbnail(anime.attributes.posterImage.medium)
//             .setColor(await getColor(this.user))
//             .setFooter({ text: 'Source: MangaDex' }),
//         ],
//       });
//     } catch (error) {
//       await this.reply(UnknownError(this, String(error)));
//     }
//   },
// });
