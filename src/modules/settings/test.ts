// import { avatar } from '$lib/functions/avatar';
// import canvas from 'canvas';
// import fetch from 'node-fetch';
// import { ChatCommand, getDiscordClient, OptionBuilder } from 'purplet';

// async function uploadEmoji(image: string | Buffer, name: string, roundEdges = false) {
//   const client = getDiscordClient();
//   const testGuild = client.guilds.cache.get('843530687260524585');

//   if (roundEdges) {
//     const img = canvas.createCanvas(64, 64);
//     const ctx = img.getContext('2d');
//     const imgBuffer =
//       image instanceof Buffer ? image : Buffer.from(await (await fetch(image)).arrayBuffer());
//     const imgData = await canvas.loadImage(imgBuffer);

//     ctx.beginPath();
//     ctx.arc(32, 32, 32, 0, Math.PI * 2);
//     ctx.clip();
//     ctx.drawImage(imgData, 0, 0, 64, 64);
//     ctx.closePath();

//     image = img.toBuffer();
//   }

//   const emoji = await testGuild.emojis.create(image, name);

//   return emoji;
// }

// export default ChatCommand({
//   name: 'test',
//   description: 'use an avatar and see it as an emoji',
//   options: new OptionBuilder()
//     .user('user1', 'yeah', { required: true })
//     .user('user2', 'yeah yeah', { required: true }),
//   async handle({ user1, user2 }) {
//     await this.deferReply();

//     const emojis = [
//       await uploadEmoji(avatar(this.user), this.user.username, true),
//       await uploadEmoji(avatar(user1), user1.username, true),
//       await uploadEmoji(avatar(user2), user2.username, true),
//     ];

//     await this.editReply(`**${emojis.map((e) => e.toString())} + 4 others**`);

//     setTimeout(() => {
//       emojis.forEach((emoji) => emoji.delete());
//     }, 5000);
//   },
// });