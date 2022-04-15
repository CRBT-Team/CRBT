// import { emojis, illustrations } from '$lib/db';
// import {
//   AudioPlayerStatus,
//   createAudioPlayer,
//   createAudioResource,
//   entersState,
//   joinVoiceChannel,
//   VoiceConnectionStatus,
// } from '@discordjs/voice';
// import { MessageEmbed, VoiceChannel } from 'discord.js';
// import {
//   ButtonComponent,
//   ChatCommand,
//   components,
//   OptionBuilder,
//   row,
//   SelectMenuComponent,
// } from 'purplet';
// import ytdl from 'ytdl-core';

// const player = createAudioPlayer();

// export default ChatCommand({
//   name: 'play',
//   description:
//     'Plays absolutely nothing. This is just a mockup to visualize possible music command control layout.',
//   options: new OptionBuilder().string('query', 'A URL or title to search', true),
//   async handle({ query }) {
//     if (this.user.id !== '327690719085068289') {
//       return this.reply("you're not clembs therefore i don't give a shart about you");
//     }
//     await this.deferReply();
//     const channel = (await this.guild.members.fetch(this.user)).voice.channel as VoiceChannel;

//     await playSong(query);

//     const connection = await connectToChannel(channel);

//     const { videoDetails } = await ytdl.getBasicInfo(query);

//     connection.subscribe(player);

//     await this.editReply({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({ name: 'Now Playing', iconURL: icons.music.information })
//           .setTitle(videoDetails.title)
//           .setURL(videoDetails.video_url)
//           .setDescription(`\`00:00/${videoDetails.lengthSeconds}\`\nPlaying in ${channel}`)
//           .addField(
//             'Uploaded by',
//             `**[${videoDetails.author.name}](${videoDetails.author.channel_url})**`,
//             true
//           )
//           .addField('Added by', `${this.user}`, true)
//           .addField('Volume', '100%')
//           .setThumbnail(videoDetails.thumbnails.find((t) => t.width === 1920).url),
//       ],
//       components: components(
//         row(
//           new PlayPause(true).setEmoji(emojis.music.pause).setStyle('PRIMARY')
//           // new Skip().setEmoji(emojis.music.skip).setStyle('SECONDARY')
//         )
//         // row(
//         //   new Tracks().addOptions(
//         //     tracks.map((track) => ({
//         //       label: track.title,
//         //       description: `${track.length} • Added by ${track.addedBy.username}`,
//         //       value: `${shortenUrl(track.url)}|${track.addedBy.id}`,
//         //     }))
//         //   )
//         // )
//       ),
//     });
//   },
// });

// export const PlayPause = ButtonComponent({
//   handle(ctx: any) {
//     if (ctx) {
//       player.pause();
//     } else {
//       player.unpause();
//     }
//     this.update({
//       embeds: this.message.embeds,
//       components: components(
//         row(
//           new PlayPause(!ctx)
//             .setEmoji(ctx ? emojis.music.play : emojis.music.pause)
//             .setStyle('PRIMARY')
//           // new Skip().setEmoji(emojis.music.skip).setStyle('SECONDARY')
//         )
//         // row().addComponents(this.message.components[1].components[0] as MessageSelectMenu)
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

// const connectToChannel = async (channel: VoiceChannel) => {
//   const connection = joinVoiceChannel({
//     channelId: channel.id,
//     guildId: channel.guild.id,
//     adapterCreator: channel.guild.voiceAdapterCreator,
//   });

//   try {
//     await entersState(connection, VoiceConnectionStatus.Ready, 30000);
//     return connection;
//   } catch (error) {
//     connection.destroy();
//     throw error;
//   }
// };

// const playSong = (query: string) => {
//   const stream = ytdl(query, { filter: 'audioonly' });
//   const resource = createAudioResource(stream);
//   player.play(resource);

//   return entersState(player, AudioPlayerStatus.Playing, 30000);
// };
