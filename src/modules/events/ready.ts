import { db } from '$lib/db';
import { setReminder } from '$lib/functions/setReminder';
import { reminders } from '@prisma/client';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  (await db.reminders.findMany()).forEach(async (reminder: reminders) => {
    await setReminder(reminder);
  });
});
