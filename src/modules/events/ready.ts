import { db, emojis } from '$lib/db';
import { button } from '$lib/functions/button';
import { getColor } from '$lib/functions/getColor';
import { setLongerTimeout } from '$lib/functions/setLongerTimeout';
import { userDMsEnabled } from '$lib/functions/userDMsEnabled';
import { Reminder } from '$lib/types/CRBT/Reminder';
import dayjs from 'dayjs';
import { GuildTextBasedChannel, MessageActionRow, MessageEmbed } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: '/crbt info | crbt.ga',
  });

  (await db.from<Reminder>('reminders').select('*')).body.forEach((reminder) => {
    setLongerTimeout(async () => {
      const user = await client.users.fetch(reminder.user_id);
      const dest =
        reminder.destination === 'dm' && userDMsEnabled(user)
          ? user
          : ((await client.channels.fetch(reminder.destination)) as GuildTextBasedChannel);

      await dest.send({
        content: reminder.destination !== 'dm' ? `<@${reminder.user_id}>` : null,
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.misc.reminder} Reminder`)
            .setDescription(
              `Set on <t:${dayjs(reminder.expiration).unix()}> (<t:${dayjs(
                reminder.expiration
              ).unix()}:R>).`
            )
            .addField('Reminder', reminder.reminder)
            .setColor(await getColor(await client.users.fetch(reminder.user_id))),
        ],
        components: [
          new MessageActionRow().addComponents(button('LINK', 'Jump to message', reminder.url)),
        ],
      });

      await db
        .from<Reminder>('reminders')
        .delete()
        .eq('id', reminder.id)
        .eq('user_id', reminder.user_id);
    }, dayjs(reminder.expiration).diff(new Date()));
  });
});
