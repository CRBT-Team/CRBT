import { db, emojis } from '$lib/db';
import { Reminder } from '$lib/types/CRBT/Reminder';
import dayjs from 'dayjs';
import { GuildTextBasedChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { getColor } from './getColor';
import { setLongerTimeout } from './setLongerTimeout';
import { userDMsEnabled } from './userDMsEnabled';

export const setReminder = async (reminder: Reminder) => {
  const id = reminder.id ? reminder.id : (await db.set<Reminder>('reminders', reminder)).id;

  setLongerTimeout(async () => {
    const user = await getDiscordClient().users.fetch(reminder.user_id);
    const dest =
      reminder.destination === 'dm' && userDMsEnabled(user)
        ? user
        : ((await getDiscordClient().channels.fetch(
            reminder.destination
          )) as GuildTextBasedChannel);

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
          .setColor(await getColor(await getDiscordClient().users.fetch(reminder.user_id))),
      ],
      components: components(
        row(new MessageButton().setStyle('LINK').setLabel('Jump to message').setURL(reminder.url))
      ),
    });

    await db.from<Reminder>('reminders').delete().eq('id', id).eq('user_id', reminder.user_id);
  }, dayjs(reminder.expiration).diff(new Date()));
};
