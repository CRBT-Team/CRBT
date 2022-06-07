import { db } from '$lib/db';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  (await db.timeouts.findMany()).forEach(async (timeout) => {
    await setDbTimeout(timeout, true);
  });
});
