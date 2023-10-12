import { prisma } from '$lib/db';
// import { clients, servers } from '$lib/env';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { AnyTimeout, TimeoutTypes } from '$lib/types/timeouts';
// import { Routes } from 'discord-api-types/v10';
import { ApplicationCommand, Client, Collection } from 'discord.js';
// import { getRestClient, OnEvent } from 'purplet';
import { OnEvent } from 'purplet';
// import { economyCommands } from '../economy/_helpers';
// import { getGuildSettings } from '../settings/serverSettings/_helpers';

export let allCommands: Collection<string, ApplicationCommand>;

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  // await Promise.all(await loadEconomyCommands(client)).then(async () => {
  allCommands = await client.application.commands.fetch({
    guildId: client.user.id !== clients.crbt.id ? servers.community : undefined,
  });

  console.log(`Loaded ${allCommands.size} commands`);
  // });

  loadTimeouts(client);
});

function loadTimeouts(client: Client) {
  Object.values(TimeoutTypes).forEach((type) => {
    if (type === TimeoutTypes.Reminder && client.user.id !== clients.crbt.id) return;

    (prisma[type as string].findMany() as Promise<AnyTimeout[]>).then((timeouts) =>
      timeouts
        // load timeouts:
        // if they have a 'type', they're a moderation entry and only timeouts that haven't expired yet should be loaded
        // otherwise,  all timeouts should be loaded
        .filter((t) => ('type' in t ? t.endDate && t.endDate.getTime() > Date.now() : true))
        .map((t) => dbTimeout(type, t, true)),
    );
  });
}

// async function loadEconomyCommands(client: Client): Promise<Promise<any>[]> {
//   const promises: Promise<any>[] = [];

//   if (client.user.id !== clients.crbt.id) {
//     const { modules, economy } = await getGuildSettings(servers.community);

//     if (modules.economy) {
//       Object.entries(economyCommands).map(([name, command]) => {
//         if (!economy.categories.length && name === 'shop') {
//           return;
//         }

//         const commandMeta = command.getMeta({
//           plural: economy.currency_name_plural,
//           singular: economy.currency_name_singular,
//         });

//         promises.push(
//           getRestClient().post(
//             Routes.applicationGuildCommands(client.application.id, servers.community),
//             { body: commandMeta }
//           )
//         );
//       });
//     }
//   }
//   return promises;
// }
