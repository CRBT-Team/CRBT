// import { prisma } from '$lib/db';
// import { avatar } from '$lib/functions/avatar';
// import { UnknownError } from '$lib/functions/CRBTError';
// import { getColor } from '$lib/functions/getColor';
// import { ChatCommand, OptionBuilder } from 'purplet';
// import { getSettings } from '../settings/serverSettings/_helpers';

// export default ChatCommand({
//   name: 'balance',
//   description: "Get a user's balance for this server.",
//   options: new OptionBuilder().user(
//     'user',
//     'The user whose balance to get. Leave blank to get yours.'
//   ),
//   async handle({ user }) {
//     user ??= this.user;

//     try {
//       const leaderboard = await prisma.serverMember.findMany({
//         where: { id: `${user.id}_${this.guildId}` },
//         orderBy: { money: 'desc' },
//         select: { userId: true, money: true },
//       });

//       const rank = leaderboard.findIndex(({ userId }) => userId === user.id);
//       console.log(rank);

//       const { economy } = await getSettings(this.guildId);
//       const { money } = leaderboard[rank] || { money: 0 };

//       this.reply({
//         embeds: [
//           {
//             author: {
//               icon_url: avatar(user),
//               name: `${user.tag} - Balance`,
//             },
//             description: `${economy.currencySymbol} ${money} ${
//               money === 1 ? economy.currencyNamePlural : economy.currencyNamePlural
//             }`,
//             fields: [
//               {
//                 name: 'Leaderboard Rank',
//                 value:
//                   money === 0
//                     ? 'Not on the server leaderboard.'
//                     : `**${ordinal(rank + 1, this.locale)}** on the server leaderboard.`,
//               },
//             ],
//             color: await getColor(this.user),
//           },
//         ],
//       });
//     } catch (error) {
//       this.reply(UnknownError(this, String(error)));
//     }
//   },
// });

// const suffixes = new Map([
//   ['one', 'st'],
//   ['two', 'nd'],
//   ['few', 'rd'],
//   ['other', 'th'],
// ]);

// const ordinal = (n: number, lang: string) => {
//   const intl = new Intl.PluralRules(lang, { type: 'ordinal' });
//   const rule = intl.select(n);
//   const suffix = suffixes.get(rule);
//   return `${n}${suffix}`;
// };
