import { db } from '$lib/db';
import { setReminder } from '$lib/functions/setReminder';
import { Reminder } from '$lib/types/CRBT/Reminder';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: '/crbt info | crbt.ga',
  });

  (await db.from<Reminder>('reminders').select('*')).body.forEach(async (reminder) => {
    await setReminder(reminder);
  });
});
