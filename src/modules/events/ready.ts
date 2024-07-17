import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { AnyTimeout, TimeoutTypes } from '$lib/types/timeouts';
import { Routes } from 'discord-api-types/v10';
import { ApplicationCommand, Client, Collection } from 'discord.js';
import { OnEvent, getRestClient } from 'purplet';
import { economyCommands } from '../economy/_helpers';
import { getGuildSettings } from '../settings/server-settings/_helpers';

export let allCommands: Collection<string, ApplicationCommand>;

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  if (client.user.id !== clients.crbt.id) {
    console.log(`Skipping timeouts`);
  } else {
    loadTimeouts(client);
  }

  await loadEconomyCommands(client);

  allCommands = await client.application.commands.fetch({
    guildId: client.user.id !== clients.crbt.id ? servers.community : undefined,
  });

  console.log(`Loaded ${allCommands.size} commands`);
});

function loadTimeouts(client: Client) {
  Object.values(TimeoutTypes).forEach((type) => {
    (prisma[type as string].findMany() as Promise<AnyTimeout[]>).then((timeouts) => {
      timeouts.forEach((t) => {
        if (!!t.endDate) {
          dbTimeout(type, t, true);
        }
      });
    });
  });
}

async function loadEconomyCommands(client: Client) {
  const { modules, economy } = await getGuildSettings(servers.community);

  if (client.user.id !== clients.crbt.id && modules.economy) {
    return await Promise.all(
      Object.entries(economyCommands).map(async ([name, command]) => {
        if (!economy.categories.length && name === 'shop') return;

        console.log(`Fetching ${name}`);

        const commandMeta = command.getMeta({
          plural: economy.currencyNamePlural,
          singular: economy.currencyNameSingular,
        });

        await getRestClient().post(
          Routes.applicationGuildCommands(client.application.id, servers.community),
          { body: commandMeta },
        );
        console.log(`Posted ${name}`);
      }),
    );
  }
}
