import { db, misc } from '$lib/db';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import { initStatcord } from '$lib/statcord';
import { ApplicationCommand, Collection } from 'discord.js';
import { OnEvent } from 'purplet';

export let allCommands: Collection<string, ApplicationCommand>;

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  allCommands = await client.application.commands.fetch({
    guildId: client.user.id !== misc.CRBTid ? '949329353047687189' : undefined,
  });

  console.log(`Loaded ${allCommands.size} commands.`);

  const timeouts = await db.timeouts.findMany();

  console.log(`Loaded ${timeouts.length} timeouts`);

  timeouts.forEach(async (timeout) => {
    await setDbTimeout(timeout, true);
  });

  const statcord = initStatcord(client);

  statcord.autopost();

  console.log('Connected to Statcord');
});
