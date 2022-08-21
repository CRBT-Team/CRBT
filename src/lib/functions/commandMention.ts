import { allCommands } from '../../modules/events/ready';

export function slashCmd(commandName: string) {
  const rootCmdName = commandName.split(' ')[0];

  const command = allCommands.find((c) => c.name === rootCmdName);

  return `</${commandName}:${command.id}>`;
}
