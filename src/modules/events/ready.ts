import { db } from '$lib/db';
import { Reminder } from '$lib/types/CRBT/Reminder';
import { MessageEmbed, TextBasedChannel } from 'discord.js';
import ms from 'ms';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: '/crbt info | crbt.ga',
  });

  (await db.from<Reminder>('reminders').select('*')).body.forEach((reminder) => {
    console.log(reminder);

    setTimeout(async () => {
      const channel =
        reminder.destination === 'dm'
          ? await client.users.fetch(reminder.user_id)
          : (client.channels.cache.get(reminder.destination) as TextBasedChannel);
      if (channel) {
        await channel.send({
          embeds: [new MessageEmbed().setTitle('Reminder').setDescription(reminder.reminder)],
        });
      }
      await db
        .from<Reminder>('reminders')
        .delete()
        .eq('id', reminder.id)
        .eq('user_id', reminder.user_id);
    }, ms(ms(new Date(reminder.expiration).getTime() - Date.now())));
  });
});
