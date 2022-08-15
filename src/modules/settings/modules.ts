// import { colors, db, icons } from '$lib/db';
// import { CRBTError } from '$lib/functions/CRBTError';
// import { MessageEmbed } from 'discord.js';
// import { ChatCommand, OptionBuilder } from 'purplet';

// const choices = {
//   joinMessage: 'Welcome messages',
//   leaveMessage: 'Farewell messages',
// };

// export default ChatCommand({
//   name: 'module enable',
//   description: 'Choose a module to enable.',
//   allowInDMs: false,
//   options: new OptionBuilder().string('module', 'The module to enable.', {
//     choices,
//     required: true,
//   }),
//   async handle({ module }) {
//     const data = await db.serverModules.findFirst({
//       where: { id: this.guild.id },
//       select: { [module]: true },
//     });

//     if (data[module]) {
//       return this.reply(CRBTError(`The module "${choices[module]}" is already enabled.`));
//     }

//     await db.serverModules.upsert({
//       where: { id: this.guild.id },
//       create: {
//         id: this.guild.id,
//         [module]: true,
//       },
//       update: {
//         [module]: true,
//       },
//     });

//     await this.reply({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({
//             name: `CRBT Settings - ${choices[module]} Enabled`,
//             iconURL: icons.success,
//           })
//           .setColor(`#${colors.success}`),
//       ],
//     });
//   },
// });

// export const disable = ChatCommand({
//   name: 'module disable',
//   description: 'Choose a module to disable.',
//   allowInDMs: false,
//   options: new OptionBuilder().string('module', 'The module to disable.', {
//     choices,
//     required: true,
//   }),
//   async handle({ module }) {
//     const data = await db.serverModules.findFirst({
//       where: { id: this.guild.id },
//       select: { [module]: true },
//     });

//     if (!data[module]) {
//       return this.reply(CRBTError(`The module "${choices[module]}" is already disabled.`));
//     }

//     await db.serverModules.upsert({
//       where: { id: this.guild.id },
//       create: {
//         id: this.guild.id,
//         [module]: false,
//       },
//       update: {
//         [module]: false,
//       },
//     });

//     await this.reply({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({
//             name: `CRBT Settings - ${choices[module]} Disabled`,
//             iconURL: icons.success,
//           })
//           .setColor(`#${colors.success}`),
//       ],
//     });
//   },
// });
