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

  // try {
  //   console.log(cmdName);

  //   let value = cache.get(`tlm_${i.user.id}`);

  //   if (value === undefined) {
  //     const fromDB = await prisma.user.findFirst({
  //       where: { id: i.user.id },
  //       select: { telemetry: true },
  //     });

  //     cache.set(`tlm_${i.user.id}`, fromDB?.telemetry === undefined ? true : fromDB?.telemetry);
  //     value = fromDB?.telemetry === undefined ? true : fromDB?.telemetry;
  //   }

  //   if (value === false) return;
  // } catch (e) {
  //   UnknownError(i, e);
  // }
  const channel = i.client.channels.cache.get(channels.telemetry) as TextChannel;


  // if (i.client.user.id === misc.CRBTid) {
  await prisma.statistics.update({
    where: { date: dayjs().startOf('day').toISOString() },
    data: {
      commandsUsed: { push: commandName },
      uniqueUsers: { push: i.user.id },
    }
  })
  // }

  channel.send({
    embeds: [
      {
        description: i.isCommand() ? `</${commandName}:${i.commandId}>` : `\`${commandName}\``,
        fields: [
          {
            name: 'Platform',
            value: i.guild ? 'Guild' : 'DM'
          }
        ]
      }
    ],
  });
});
