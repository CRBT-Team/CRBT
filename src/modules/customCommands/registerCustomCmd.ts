// import { ApplicationCommandType } from 'discord-api-types/v10';
// import { Client } from 'discord.js';
// import { customCmds, CustomCommand } from './commands';

// export function registerCustomCmd(command: CustomCommand, client: Client, guildId: string) {
//   customCmds.set(command.name, command);

//   return client.application.commands.create(
//     {
//       name: command.name,
//       description: command.description,
//       type: ApplicationCommandType.ChatInput,
//       options: command.options,
//     },
//     guildId
//   );
// }
