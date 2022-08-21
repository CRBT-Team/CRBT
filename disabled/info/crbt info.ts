// import { links } from '$lib/db';
// import { avatar } from '$lib/functions/avatar';
// import { getColor } from '$lib/functions/getColor';
// import { t } from '$lib/language';
// import dayjs from 'dayjs';
// import { MessageButton, MessageEmbed } from 'discord.js';
// import { ChatCommand, components, row } from 'purplet';
// import pjson from '../../../package.json';

// const { meta } = t('en-US', 'crbt info');

// // export default
// ChatCommand({
//   name: 'crbt info',
//   description: meta.description,
//   async handle() {
//     await this.deferReply();

//     const { strings } = t(this, 'crbt info');

//     const uptime = dayjs().subtract(this.client.uptime).unix();
//     const created = dayjs(this.client.user.createdAt).unix();

//     await this.editReply({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({
//             name: strings.EMBED_TITLE.replace('<CRBT>', this.client.user.username),
//             iconURL: avatar(this.client.user),
//             url: links.baseURL,
//           })
//           .setDescription(
//             strings.VERSION.replace('<VERSION>', pjson.version).replace(
//               '<PURPLET>',
//               `**[Purplet ${pjson.dependencies['purplet'].slice(1)}](${links.purplet})**`
//             )
//           )
//           .addField(
//             strings.MEMBER_COUNT,
//             this.client.users.cache.size.toLocaleString(this.locale),
//             true
//           )
//           .addField(
//             strings.SERVER_COUNT,
//             this.client.guilds.cache.size.toLocaleString(this.locale),
//             true
//           )
//           .addField(
//             strings.PING,
//             `${strings.PING_RESULT.replace(
//               '<PING>',
//               `${Date.now() - this.createdTimestamp}`
//             )} (\`/ping\`)`
//           )
//           .addField(strings.CREATED, `<t:${created}> (<t:${created}:R>)`)
//           .addField(strings.UPTIME, `<t:${uptime}> (<t:${uptime}:R>)`)
//           .setThumbnail(avatar(this.client.user))
//           .setColor(await getColor(this.user)),
//       ],
//       components: components(
//         row(
//           new MessageButton()
//             .setStyle('LINK')
//             .setEmoji('❤️')
//             .setLabel(strings.BUTTON_DONATE)
//             .setURL(links.donate),
//           new MessageButton()
//             .setStyle('LINK')
//             .setLabel(strings.BUTTON_WEBSITE)
//             .setURL('https://crbt.app'),
//           new MessageButton().setStyle('LINK').setLabel(strings.BUTTON_INVITE).setURL(links.invite),
//           new MessageButton()
//             .setStyle('LINK')
//             .setLabel(strings.BUTTON_DISCORD)
//             .setURL(links.discord)
//         )
//       ),
//     });
//   },
// });
