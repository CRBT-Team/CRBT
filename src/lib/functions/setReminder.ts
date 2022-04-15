import { db, emojis } from '$lib/db';
import { reminders } from '@prisma/client';
import dayjs from 'dayjs';
import { GuildTextBasedChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { SnoozeButton } from '../../modules/components/RemindButton';
import { getColor } from './getColor';
import { setLongerTimeout } from './setLongerTimeout';

export const setReminder = async (reminder: reminders) => {
  const id = reminder.id
    ? reminder.id
    : (
        await db.reminders.create({
          data: reminder,
        })
      ).id;

  setLongerTimeout(async () => {
    const user = await getDiscordClient().users.fetch(reminder.user_id);
    const dest =
      reminder.destination === 'dm'
        ? user
        : ((await getDiscordClient().channels.fetch(
            reminder.destination
          )) as GuildTextBasedChannel);

    dest
      .send({
        content: reminder.destination !== 'dm' ? user.toString() : null,
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.reminder} Reminder`)
            .setDescription(
              `Set on <t:${dayjs(reminder.expiration).unix()}> (<t:${dayjs(
                reminder.expiration
              ).unix()}:R>).`
            )
            .addField('Reminder', reminder.reminder)
            .setColor(await getColor(await getDiscordClient().users.fetch(reminder.user_id))),
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
        const dest = (await getDiscordClient().channels.fetch(
          reminder.url.split('/')[1]
        )) as GuildTextBasedChannel;
        await dest.send({
          content: user.toString(),
          embeds: [
            new MessageEmbed()
              .setTitle(`${emojis.reminder} Reminder`)
              .setDescription(
                `Set on <t:${dayjs(reminder.expiration).unix()}> (<t:${dayjs(
                  reminder.expiration
                ).unix()}:R>).`
              )
              .addField('Reminder', reminder.reminder)
              .setColor(await getColor(await getDiscordClient().users.fetch(reminder.user_id))),
          ],
          components: components(
            row(
              new MessageButton()
                .setStyle('LINK')
                .setLabel('Jump to message')
                .setURL(`https://discord.com/channels/${reminder.url}`),
              new SnoozeButton().setStyle('SECONDARY').setEmoji(emojis.reminder).setLabel('Snooze')
            )
          ),
        });
      });

    await db.reminders.delete({
      where: {
        id,
      },
    });
  }, dayjs(reminder.expiration).diff(new Date()));
};
