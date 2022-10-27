import { prisma } from '$lib/db';
import { channels, clients } from '$lib/env';
import dayjs from 'dayjs';
import { TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
// import { customCmds } from '../customCommands/commands';

export default OnEvent('interactionCreate', async (i) => {
  if (!i.isCommand() && !i.isContextMenu()) return;

  if (![clients.dev.id, clients.crbt.id].includes(i.client.user.id)) return;

  const commandName = [
    i.commandName,
    i.options.data.find((o) => o.type === 'SUB_COMMAND_GROUP')?.name,
    i.options.data.find((o) => o.type === 'SUB_COMMAND')?.name,
  ]
    .filter(Boolean)
    .join(' ');

  // if (i.isCommand() && customCmds.has(i.commandName)) {
  //   const cmd = customCmds.get(i.commandName);
  //   cmd.handle(i, i.options);
  // }

  const channel = i.client.channels.cache.get(channels.telemetry) as TextChannel;

  channel.send({
    embeds: [
      {
        description: i.isCommand() ? `</${commandName}:${i.commandId}>` : `\`${commandName}\``,
        fields: [
          {
            name: 'Platform',
            value: i.guild ? 'Guild' : 'DM',
          },
        ],
      },
    ],
  });

  if (i.client.user.id === clients.crbt.id) {
    await prisma.statistics.update({
      where: { date: dayjs().startOf('day').toISOString() },
      data: {
        commandsUsed: { push: commandName },
        uniqueUsers: { push: i.user.id },
      },
    });
  }
});
