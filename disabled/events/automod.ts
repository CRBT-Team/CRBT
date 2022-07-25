// import { colors, icons } from '$lib/db';
// import { webhookSend } from '$lib/functions/webhookSend';
// import { Collection, Message, MessageEmbed, TextBasedChannel } from 'discord.js';
// import fetch from 'node-fetch';
// import { ButtonComponent, OnEvent } from 'purplet';
// import badwords from '../../../data/misc/badwords.json';
// type actionType = 'ban' | 'kick' | 'censor' | 'warn' | 'strike' | 'timeout' | 'delete' | 'none';

// const blocklist = {
//   users: [],
//   keywords: badwords,
//   links: (
//     (await fetch(
//       'https://raw.githubusercontent.com/Dogino/Discord-Phishing-URLs/main/scam-urls.txt'
//     ).then((r) => r.text())) as string
//   ).split('\n'),
//   terms: (
//     (await fetch(
//       'https://raw.githubusercontent.com/DevSpen/scam-links/master/src/malicious-terms.txt'
//     ).then((r) => r.text())) as string
//   ).split('\n'),
// };

// const actions: { [k: string]: actionType } = {
//   keywords: 'censor',
//   users: 'none',
//   links: 'timeout',
//   terms: 'warn',
//   spam: 'delete',
// };
// const recentMessages = new Collection<string, Message[]>();
// const censorType: 'hash' | 'spoiler' = 'hash';
// const spamMessageLimit = 5;
// const askFirst = true;
// const modlogChannel = '960653454471225465';

// export default OnEvent('messageCreate', async (message) => {
//   const { channel, guild, content, embeds, type, author } = message;

//   if (channel.type === 'DM') return;
//   if (!author) return;
//   if (!guild) return;
//   if (!content && !embeds) return;
//   if (message.webhookId) return;
//   if (
//     !(
//       [
//         'REPLY',
//         'DEFAULT',
//         'APPLICATION_COMMAND',
//         'THREAD_STARTER_MESSAGE',
//         'CONTEXT_MENU_COMMAND',
//       ] as Message['type'][]
//     ).includes(type)
//   )
//     return;

//   let sanction: keyof typeof blocklist | 'spam';

//   const member = guild.members.cache.get(author.id);
//   const allContent = `${content} ${
//     embeds
//       ? embeds
//           .filter(Boolean)
//           .map((e) => [
//             e.author?.name,
//             e.description,
//             e.title,
//             e.footer?.text,
//             ...e.fields?.map(({ name, value }) => [name, value].filter(Boolean)),
//           ])
//           .filter(Boolean)
//           .join(' ')
//       : ''
//   }`
//     .split(' ')
//     .filter(Boolean);

//   console.log(allContent);

//   const recent = recentMessages.get(author.id) ?? [];
//   console.log(recent.length);
//   recent.push(message);
//   if (recent.length > spamMessageLimit + 1) recent.shift();
//   if (recent.length > spamMessageLimit) {
//     // if all messages are the same, then it's a spam
//     if (recent.every((m) => recent[0].content.toLowerCase() === m.content.toLowerCase())) {
//       sanction = 'spam';
//     } else if (recent[0].createdTimestamp - recent[recent.length - 1].createdTimestamp < 60000) {
//       sanction = 'spam';
//     }
//   }
//   console.log(recent.map((m) => m.content));
//   recentMessages.set(author.id, recent);

//   allContent.forEach((word) => {
//     if (blocklist.links.includes(word.toLowerCase())) {
//       sanction = 'links';
//     }
//     if (blocklist.keywords.includes(word.toLowerCase())) {
//       sanction = 'keywords';
//     }
//   });

//   if (sanction) {
//     console.log(sanction);
//     const modlogs = guild.channels.cache.get(modlogChannel);
//     switch (actions[sanction]) {
//       case 'censor':
//         const censoredMessage = message.content
//           .split(' ')
//           .map((word) => {
//             if (blocklist.keywords.includes(word.toLowerCase())) {
//               console.log(word);
//               // @ts-ignore
//               if (censorType === 'hash') {
//                 return '#'.repeat(word.length);
//               } else if (censorType === 'spoiler') {
//                 return `||${word}||`;
//               }
//             }
//             return word;
//           })
//           .join(' ');
//         message.delete();
//         webhookSend(message, censoredMessage, author.username, author.avatarURL());
//         break;
//       case 'delete':
//         if (sanction === 'spam') {
//           channel.bulkDelete(recent);
//           recentMessages.set(author.id, []);
//         } else {
//           if (message.deletable) {
//             message.delete();
//           }
//         }
//         break;
//       case 'timeout':
//         if (member) {
//           member.timeout(300000, `CRBT Automod - ${sanction}`);
//           channel.send({}).then((msg) => setTimeout(() => msg.delete(), 5000));
//         }
//         break;
//       case 'none':
//         break;
//     }
//   }
// });

// export const confirmThreat = ButtonComponent({
//   async handle({ authorId, channelID, messageId, sanction }) {
//     const author = this.guild.members.cache.get(authorId);
//     const channel = this.guild.channels.cache.get(channelID) as TextBasedChannel;
//     const message = await channel.messages.fetch(messageId);

//     this.channel.send({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({ name: `${author.user.tag} was timed out`, iconURL: icons.success })
//           .addField('Reason', sanction, true)
//           .addField('Duration', '5 minutes'),
//         new MessageEmbed()
//           .setAuthor({ name: author.user.tag, iconURL: author.user.avatarURL() })
//           .setDescription(message.content)
//           .setColor(`#${colors.yellow}`),
//       ],
//     });
//   },
// });
