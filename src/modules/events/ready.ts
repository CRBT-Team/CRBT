import { db } from '$lib/db';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import { initStatcord } from '$lib/statcord';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  const timeouts = await db.timeouts.findMany();

  console.log(`Loaded ${timeouts.length} timeouts`);

  timeouts.forEach(async (timeout) => {
    await setDbTimeout(timeout, true);
  });

  const statcord = initStatcord(client);

  statcord.autopost();

  console.log('Connected to Statcord');
});
