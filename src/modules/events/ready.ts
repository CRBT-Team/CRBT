import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { AnyTimeout, TimeoutTypes } from '$lib/types/timeouts';
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
});
