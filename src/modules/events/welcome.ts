// import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
// import { APIEmbed, APIEmbedAuthor, APIEmbedField } from 'discord-api-types/v10';
// import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
// import { OnEvent } from 'purplet';
// import { details } from '../settings/welcome message';

// export interface WelcomeDB {
//   [guildId: string]: {
//     welcome_message: { script?: string; embed?: Partial<APIEmbed>; content?: string };
//     welcome_channel: string;
//   };
// }

// export const welcomeDb: WelcomeDB = {
//   '949329353047687189': {
//     welcome_message: {
//       script: '<user.roles.add(949330137344770089)> <user.roles.remove(949330137344770089)>',
//       embed: {
//         title: 'Hi <user.name>',
//         description: 'Welcome to the <server.name> server.',
//         color: 0x00ff00,
//         author: { name: 'motherfucker' },
//         footer: { text: 'nice' },
//       },
//     },
//     welcome_channel: '949329978972045382',
//   },
// };

// export default OnEvent('guildMemberAdd', (member) => {
//   const { guild } = member;

//   const { welcome_channel: channelId, welcome_message: message } = welcomeDb[guild.id];

//   if (!channelId || !message) return;

//   const channel = guild.channels.cache.get(channelId) as GuildTextBasedChannel;

//   if (message.script) {
//     parseCRBTscript(message.script, {
//       member,
//       channel,
//     });
//   }

//   if (message.content) {
//     message.content = parseCRBTscript(message.content, {
//       channel,
//       member,
//     });
//   }

//   if (message.embed) {
//     message.embed = new MessageEmbed(
//       Object.entries(message.embed).reduce((acc, [key, value]) => {
//         console.log(acc);
//         let newValue: any = value;

//         const [_, __, ___, markdownSupport, CRBTscriptSupport] = details.find(([id]) => id === key);

//         if (value && CRBTscriptSupport) {
//           if (key === 'fields') {
//             newValue = (value as APIEmbedField[]).map((field) => {
//               return {
//                 name: parseCRBTscript(field.name, {
//                   channel,
//                   member,
//                 }),
//                 value: parseCRBTscript(field.value, {
//                   channel,
//                   member,
//                 }),
//                 inline: field.inline,
//               };
//             });
//           } else if (key === 'author') {
//             newValue = {
//               name: parseCRBTscript((value as APIEmbedAuthor)?.name, {
//                 channel,
//                 member,
//               }),
//             };
//           } else {
//             newValue = parseCRBTscript(value as string, {
//               channel,
//               member,
//             });
//           }
//           console.log(value);
//           console.log(newValue);
//           console.log(acc);
//           acc = { ...acc, [key]: newValue };
//           console.log(acc);
//           return acc;
//         }
//       }, {} as APIEmbed)
//     ).toJSON();
//   }

//   channel.send({
//     ...(message.content ? { content: message.content } : {}),
//     embeds: [new MessageEmbed(message.embed)],
//   });
// });

// // export function getDefaultChannel(guild: Guild) {
// //   const system = guild.systemChannel;
// //   if (system.permissionsFor(guild.me).has('SEND_MESSAGES')) return system;

// //   const general = guild.channels.cache.find(
// //     (c) =>
// //       c.name === 'general' &&
// //       c.type === 'GUILD_TEXT' &&
// //       c.permissionsFor(guild.me).has('SEND_MESSAGES')
// //   ) as TextChannel;

// //   if (general) return general;

// //   return guild.channels.cache
// //     .filter((c) => c.type === 'GUILD_TEXT' && c.permissionsFor(guild.me).has('SEND_MESSAGES'))
// //     .first() as TextChannel;
// // }
