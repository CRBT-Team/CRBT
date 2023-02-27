import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { AnyTimeout, TimeoutTypes } from '$lib/types/timeouts';
import { Routes } from 'discord-api-types/v10';
import { ApplicationCommand, Client, Collection } from 'discord.js';
import { getRestClient, OnEvent } from 'purplet';
import { getSettings } from '../settings/serverSettings/_helpers';
import { economyCommands } from './interaction';

export let allCommands: Collection<string, ApplicationCommand>;

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  await Promise.all(await loadEconomyCommands(client)).then(async () => {
    allCommands = await client.application.commands.fetch({
      guildId: client.user.id !== clients.crbt.id ? servers.community : undefined,
    });

    console.log(`Loaded ${allCommands.size} commands`);
  });

  loadTimeouts();
});

function loadTimeouts() {
  Object.values(TimeoutTypes).forEach((type) =>
    (prisma[type as string].findMany() as Promise<AnyTimeout[]>).then((timeouts) =>
      timeouts.map((t) => dbTimeout(type, t, true))
    )
  );
}

async function loadEconomyCommands(client: Client): Promise<Promise<any>[]> {
  const promises: Promise<any>[] = [];

  if (client.user.id !== clients.crbt.id) {
    const { modules, economy } = await getSettings(servers.community);

    if (modules.economy) {
      Object.values(economyCommands).map((command) => {
        const commandMeta = command.getMeta({
          plural: economy.currencyNamePlural,
          singular: economy.currencyNameSingular,
        });

        promises.push(
          getRestClient().post(
            Routes.applicationGuildCommands(client.application.id, servers.community),
            { body: commandMeta }
          )
        );
      });
    }
  }
  return promises;
}
