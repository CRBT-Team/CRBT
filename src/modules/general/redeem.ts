// import { colors, links } from '$lib/db';
// import { CRBTError } from '$lib/functions/CRBTError';
// import { getColor } from '$lib/functions/getColor';
// import { AchievementProgress } from '$lib/responses/Achievements';
// import { TokenData, TokenTypes } from '$lib/types/tokens';
// import dayjs from 'dayjs';
// import { MessageEmbed } from 'discord.js';
// import { ChatCommand, OptionBuilder } from 'purplet';

// export default ChatCommand({
//   name: 'redeem',
//   description: 'Use a compatible CRBT token to redeem a reward or unlock something.',
//   options: new OptionBuilder().string(
//     'token',
//     'A CRBT redeem token, API token, or other kind of giveaway code.',
//     { required: true }
//   ),
//   async handle({ token: tokenString }) {
//     await this.deferReply({
//       ephemeral: true,
//     });

//     const token: TokenData = (await prisma.token.findUnique({
//       where: { token: tokenString },
//     })) as any;

//     if (!token) {
//       return CRBTError(this,
//         `"${tokenString}" is not a valid token. For more info about redeemable tokens, check this [article](${links.blog.crbtTokens})`
//       );
//     }

//     if (token.type === TokenTypes.API) {
//       const decoded = decodeAPIToken(token.token);

//       if (decoded.userId !== this.user.id && token.data.userId !== this.user.id) {
//         return CRBTError(this, 'You are not authorized to use this token.');
//       }

//       await this.editReply({
//         embeds: [
//           new MessageEmbed()
//             .setTitle('CRBT API Token')
//             .setDescription(
//               `This is your CRBT API Token, which you can use to interact with the CRBT API.\n` +
//               `It was created <t:${decoded.iat}:R>.\n` +
//               `CRBT API docs can be found [here](${links.docs.api}).\n` +
//               `:warning: **Warning:** Do not share your API token with anyone.`
//             )
//             .setColor(await getColor(this.user)),
//         ],
//       });

//       await AchievementProgress.call(this, 'BREWING_APPS');
//     }
//     if (token.type === TokenTypes.Redeem) {
//       if (token.data.codeType === 'Subscription1Month') {
//         await prisma.token.update({
//           where: { token: tokenString },
//           data: { data: { ...token.data, redeemed: true } }
//         });

//         await prisma.subscription.upsert({
//           create: {
//             userId: this.user.id,
//             enabled: true,
//             endsAt: dayjs().add(1, "year").toDate(),
//           },
//           update: {
//             enabled: true,
//             endsAt: dayjs().add(1, "year").toDate(),
//           },
//           where: { userId: this.user.id }
//         });

//       }

//       await this.editReply({
//         embeds: [
//           new MessageEmbed()
//             .setTitle('CRBT+ Redeemed!')
//             .setDescription('placeholder text')
//             .setColor(colors.success)
//         ]
//       });
//     }
//   },
// });

// const decodeAPIToken = (token: string) => {
//   try {
//     const [userId, iat, _] = token
//       .split('.')
//       .slice(0, 2)
//       .map((str) => Buffer.from(str, 'base64').toString());

//     return {
//       userId,
//       iat: parseInt(iat),
//     };
//   } catch (e) {
//     return null;
//   }
// };
