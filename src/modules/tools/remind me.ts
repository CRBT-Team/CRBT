// import { MessageEmbed } from 'discord.js';
// import ms from 'ms';
// import { ChatCommand, OptionBuilder } from 'purplet';

// export default ChatCommand({
//   name: 'remind me',
//   description: 'Sets a reminder for the specified user.',
//   options: new OptionBuilder()
//     .string('time', 'The time to remind the user.', true)
//     .string('reminder', 'Whatever you need to be reminder about.', true),
//   async handle({ time, reminder }) {
//     if (time.match(/[0-9]*(\s?)(ms|s|h|d|m|w)/gim) && ms(time) < 2147483647) {
//       await this.reply(`Reminder set for ${ms(ms(time), { long: true })}`);
//       setTimeout(() => {
//         this.channel.send({
//           embeds: [new MessageEmbed().setTitle('Reminder').setDescription(reminder)],
//         });
//       }, ms(time));
//     } else {
//       await this.reply('Invalid time format or doesnt fit into a 32-bit signed integer.');
//     }
//   },
// });
