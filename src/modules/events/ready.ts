import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { RawTimeout, Timeout, TimeoutTypes } from '$lib/types/timeouts';
import dayjs from 'dayjs';
import { ApplicationCommand, Collection } from 'discord.js';
import { OnEvent } from 'purplet';

export let allCommands: Collection<string, ApplicationCommand>;

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  allCommands = await client.application.commands.fetch({
    guildId: client.user.id !== clients.crbt.id ? servers.dev : undefined,
  });

  console.log(`Loaded ${allCommands.size} commands`);

  let timeouts = new Map<string, Timeout>();

  Object.values(TimeoutTypes).forEach(async (type) => {
    (await prisma[type.toString()].findMany()).forEach(async (t: RawTimeout) => {
      timeouts.set(t.id, await dbTimeout({ ...t, type } as Timeout, true));
    });
  });

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
      members,
    },
  });
});
