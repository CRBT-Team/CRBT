import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutData } from '$lib/types/timeouts';
import dayjs from 'dayjs';
import { ApplicationCommand, Collection } from 'discord.js';
import { OnEvent } from 'purplet';

export let allCommands: Collection<string, ApplicationCommand>;
export let timeouts = new Collection<string, TimeoutData>();

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  allCommands = await client.application.commands.fetch({
    guildId: client.user.id !== clients.crbt.id ? servers.dev : undefined,
  });

  console.log(`Loaded ${allCommands.size} commands`);

  const timeouts = (await prisma.timeouts.findMany()) as TimeoutData[];

  timeouts.forEach(async (timeout) => await dbTimeout(timeout, true));

  console.log(`Loaded ${timeouts.length} timeouts`);

  const today = dayjs().startOf('day').toISOString();
  const members = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

  await prisma.statistics.upsert({
    where: { date: today },
    update: {
      servers: client.guilds.cache.size,
      members,
    },
    create: {
      date: today,
      servers: client.guilds.cache.size,
      members
    }
  })
});
