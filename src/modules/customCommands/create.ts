// import { CRBTError } from '$lib/functions/CRBTError';
// import { ChatCommand, OptionBuilder } from 'purplet';
// import { registerCustomCmd } from './registerCustomCmd';

// export default ChatCommand({
//   name: 'create',
//   description: 'creates a custom command',
//   options: new OptionBuilder()
//     .string('name', 'name of the command', { required: true })
//     .string('description', 'description of the command', { required: true })
//     .string('output', 'what to reply', { required: true }),
//   async handle({ name, description, output }) {
//     if (name.includes(' ')) {
//       return this.reply(CRBTError('Command name cannot contain spaces.'));
//     }

//     const newCommand = await registerCustomCmd(
//       {
//         name,
//         description,
//         options: [],
//         handle: async (i) => {
//           i.reply(output);
//         },
//       },
//       this.client,
//       this.guild.id
//     );

//     this.reply(`Created command </${newCommand.name}:${newCommand.id}>`);
//   },
// });
