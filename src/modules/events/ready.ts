import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { AnyTimeout, TimeoutTypes } from '$lib/types/timeouts';
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

  Object.values(TimeoutTypes).forEach((type) =>
    (prisma[type as string].findMany() as Promise<AnyTimeout[]>).then((timeouts) =>
      timeouts.map((t) => dbTimeout(type, t, true))
    )
  );

  const today = dayjs().startOf('day').toISOString();
  const members = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

  const stats = {
    guilds: (await client.guilds.fetch()).size,
  };

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
