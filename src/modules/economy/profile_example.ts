// import { emojis, items } from '$lib/db';
// import { MessageAttachment, MessageButton, MessageEmbed } from 'discord.js';
// import { ButtonComponent, ChatCommand, components, row } from 'purplet';

// export default ChatCommand({
//   name: 'profile_example',
//   description: 'lorem ipsum',
//   async handle() {
//     await this.reply({
//       files: [
//         new MessageAttachment('profile.png').setFile(
//           'https://media.discordapp.net/attachments/949329978972045382/952640713378631700/unknown.png'
//         ),
//       ],
//       components: components(
//         row(
//           new MessageButton()
//             .setLabel('clembs.xyz')
//             .setStyle('LINK')
//             .setURL('https://clembs.xyz')
//             .setEmoji('🔗'),
//           new ClassicViewButton().setLabel('View in classic mode').setStyle('SECONDARY')
//         )
//       ),
//     });
//   },
// });

// export const ClassicViewButton = ButtonComponent({
//   handle() {
//     this.update({
//       embeds: [
//         {
//           author: {
//             name: 'Clembs#3548 - Profile',
//             iconURL:
//               'https://cdn.discordapp.com/avatars/327690719085068289/e650c7d6444a26107045efef3f353b41.png',
//           },
//           title: `@Clembs ${emojis.verified}`,
//           description: `Hi I'm Clembs!\nDesigner - Developer\nCreator of CRBT.\nI have 835 Purplets :sunglasses:`,
//           fields: [
//             {
//               name: 'Badges (1)',
//               value: `${items.badges.developer.contents}`,
//               inline: true,
//             },
//             {
//               name: 'Pronouns',
//               value: `He/Him`,
//               inline: true,
//             },
//             {
//               name: 'Link',
//               value: `**[clembs.xyz](https://clembs.xyz)**`,
//             },
//           ],
//           image: {
//             url: 'https://cdn.discordapp.com/attachments/910663039156637706/926177902586896474/Artboard_1.png',
//           },
//           footer: { text: '3 Likes - 806 Purplets' },
//           color: '#6543ff',
//         },
//       ],
//       components: components(
//         row(
//           new MessageButton()
//             .setLabel('clembs.xyz')
//             .setStyle('LINK')
//             .setURL('https://clembs.xyz')
//             .setEmoji('🔗'),

//           new ModernViewButton().setLabel('View in modern mode').setStyle('SECONDARY')
//         )
//       ),
//     });
//   },
// });

// export const ModernViewButton = ButtonComponent({
//   handle() {
//     this.update({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({
//             name: '@Clembs - Profile',
//             iconURL:
//               'https://cdn.discordapp.com/avatars/327690719085068289/e650c7d6444a26107045efef3f353b41.png',
//           })
//           .setImage(
//             'https://media.discordapp.net/attachments/949329978972045382/952640713378631700/unknown.png'
//           )
//           .setColor('#6543ff'),
//       ],
//       components: components(
//         row(
//           new MessageButton()
//             .setLabel('clembs.xyz')
//             .setStyle('LINK')
//             .setURL('https://clembs.xyz')
//             .setEmoji('🔗'),

//           new ClassicViewButton().setLabel('View in classic mode').setStyle('SECONDARY')
//         )
//       ),
//     });
//   },
// });
