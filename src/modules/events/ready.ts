import { db, misc } from '$lib/db';
import { initStatcord } from '$lib/statcord';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutData } from '$lib/types/timeouts';
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

  const timeouts = (await db.timeouts.findMany()) as TimeoutData[];

  console.log(`Loaded ${timeouts.length} timeouts`);

  timeouts.forEach(async (timeout) => await dbTimeout(timeout, true));

  const statcord = initStatcord(client);

  statcord.autopost();

  console.log('Connected to Statcord');
});
