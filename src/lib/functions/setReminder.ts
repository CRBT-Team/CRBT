import { db, emojis, icons } from '$lib/db';
import { reminders } from '@prisma/client';
import dayjs from 'dayjs';
import { GuildTextBasedChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { SnoozeButton } from '../../modules/components/RemindButton';
import { getColor } from './getColor';
import { setLongerTimeout } from './setLongerTimeout';

export const setReminder = async (reminder: reminders) => {
  if (!reminder) {
    await db.reminders.create({
      data: reminder,
    });
  }

  const client = getDiscordClient();

  setLongerTimeout(async () => {
    const user = await client.users.fetch(reminder.user_id);

    const dest =
      reminder.destination === 'dm'
        ? user
        : ((await client.channels.fetch(reminder.url.split('/')[1])) as GuildTextBasedChannel);

    dest
      .send({
        content: reminder.destination !== 'dm' ? user.toString() : null,
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Reminder',
              iconURL: icons.reminder,
            })
            .setDescription(
              `Set on <t:${dayjs(reminder.expiration).unix()}> (<t:${dayjs(
                reminder.expiration
              ).unix()}:R>).`
            )
            .addField('Subject', reminder.reminder)
            .setColor(await getColor(user)),
        ],
        components: components(
          row(
            new MessageButton()
              .setStyle('LINK')
              .setLabel('Jump to message')
              .setURL(`https://discord.com/channels/${reminder.url}`)
          )
        ),
      })
      .catch(async (err) => {
        const dest = (await client.channels.fetch(
          reminder.url.split('/')[1]
        )) as GuildTextBasedChannel;

        await dest.send({
          content: user.toString(),
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: 'Reminder',
                iconURL: icons.reminder,
              })
              .setDescription(
                `Set on <t:${dayjs(reminder.expiration).unix()}> (<t:${dayjs(
                  reminder.expiration
                ).unix()}:R>).`
              )
              .addField('Subject', reminder.reminder)
              .setColor(await getColor(user)),
          ],
          components: components(
            row(
              new MessageButton()
                .setStyle('LINK')
                .setLabel('Jump to message')
                .setURL(`https://discord.com/channels/${reminder.url}`),
              new SnoozeButton(reminder.locale)
                .setStyle('SECONDARY')
                .setEmoji(emojis.reminder)
                .setLabel('Snooze')
            )
          ),
        });
      });

    await db.reminders.delete({
      where: reminder,
    });
  }, dayjs(reminder.expiration).diff(new Date()));
};
