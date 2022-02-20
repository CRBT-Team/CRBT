// import { emojis, illustrations } from '$lib/db';
// import { shortenUrl } from '$lib/util/shortenUrls';
// import { MessageEmbed, MessageSelectMenu } from 'discord.js';
// import {
//   ButtonComponent,
//   ChatCommand,
//   components,
//   OptionBuilder,
//   row,
//   SelectMenuComponent,
// } from 'purplet';

// export default ChatCommand({
//   name: 'play',
//   description:
//     'Plays absolutely nothing. This is just a mockup to visualize possible music command control layout.',
//   options: new OptionBuilder().string('query', 'A URL or title to search', true),
//   async handle({ query }) {
//     const tracks = [
//       {
//         title: 'Color Rotate Speedrun',
//         thumb: '',
//         url: 'https://clembs.xyz/watch/color-rotate-speedrun.mp4',
//         source: {
//           name: 'Clembs',
//           url: 'https://clembs.xyz',
//         },
//         addedBy: this.user,
//         length: '1:00',
//       },
//       {
//         title: 'Never Gonna Give You Up',
//         thumb: '',
//         url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
//         source: {
//           name: 'Rick Astley',
//           url: 'https://youtube.com',
//         },
//         addedBy: { id: '327690719085068289', username: 'Clembs' },
//         length: '3:59',
//       },
//     ];

//     this.reply({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({ name: 'Now Playing', iconURL: illustrations.music.information })
//           .setTitle(tracks[0].title)
//           .setURL(tracks[0].url)
//           .setDescription(`\`00:00/${tracks[0].length}\`\nPlaying in <#844903091669303296>`)
//           .addField('Source', `[${tracks[0].source.name}](${tracks[0].source.url})`, true)
//           .addField('Added by', `<@!${tracks[0].addedBy.id}>`, true)
//           .addField('Volume', '100%'),
//       ],
//       components: components(
//         row(
//           new PlayPause(true).setEmoji(emojis.music.pause).setStyle('PRIMARY'),
//           new Skip().setEmoji(emojis.music.skip).setStyle('SECONDARY')
//         ),
//         row(
//           new Tracks().addOptions(
//             tracks.map((track) => ({
//               label: track.title,
//               description: `${track.length} • Added by ${track.addedBy.username}`,
//               value: `${shortenUrl(track.url)}|${track.addedBy.id}`,
//             }))
//           )
//         )
//       ),
//     });
//   },
// });

// export const PlayPause = ButtonComponent({
//   handle(ctx: any) {
//     console.log(this.component);
//     this.update({
//       embeds: this.message.embeds,
//       components: components(
//         row(
//           new PlayPause(!ctx)
//             .setEmoji(ctx ? emojis.music.play : emojis.music.pause)
//             .setStyle('PRIMARY'),
//           new Skip().setEmoji(emojis.music.skip).setStyle('SECONDARY')
//         ),
//         row().addComponents(this.message.components[1].components[0] as MessageSelectMenu)
//       ),
//     });
//   },
// });
// export const Skip = ButtonComponent({
//   handle() {},
// });

// export const Tracks = SelectMenuComponent({
//   handle(ctx: null) {
//     console.log(this.values);
//     console.log(this.component.options);
//   },
// });
