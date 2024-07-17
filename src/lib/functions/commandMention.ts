import { allCommands } from '../../modules/events/ready';

export function slashCmd(commandName: string) {
  const rootCmdName = commandName.split(' ')[0];

  if (allCommands && allCommands.size) {
    const command = allCommands.find((c) => c.name === rootCmdName);

    return `</${commandName}:${command?.id}>`;
  } else {
    return `/${commandName}`;
  }
}
