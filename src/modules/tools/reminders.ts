import { db } from '$lib/db';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'reminders',
  description: 'Get a list of all of your reminders set with /remind me.',
  async handle() {
    const userReminders = await db.reminders.findMany({ where: { user_id: this.user.id } });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Your CRBT reminders (${userReminders.length})`)
          .setDescription(
            userReminders.length === 0
              ? "Uh oh, you don't have any reminders set. Use /remind me to set one!"
              : 'You can create a new reminder with `/remind me`!'
          )
          .setFields(
            userReminders
              .sort((a, b) => (dayjs(a.expiration).isBefore(b.expiration) ? -1 : 1))
              .map((reminder) => ({
                name: reminder.reminder,
                value:
                  `<t:${dayjs(reminder.expiration).unix()}:R>` +
                  '\n' +
                  `Destination: ${
                    reminder.destination === 'dm' ? 'In your DMs' : `<#${reminder.destination}>`
                  }`,
              }))
          )
          .setColor(await getColor(this.user)),
      ],
      ephemeral: true,
    });
  },
});
