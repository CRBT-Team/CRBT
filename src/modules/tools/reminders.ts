import { db } from '$lib/db';
import { Reminder } from '$lib/types/CRBT/Reminder';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'reminders',
  description: 'Get a list of all of your reminders set with /remind me.',
  async handle() {
    const userReminders = (
      await db.from<Reminder>('reminders').select('*').eq('user_id', this.user.id)
    ).body;

    await this.reply({
      embeds: [
        new MessageEmbed().setAuthor({ name: `Your reminders ${userReminders.length}` }).setFields(
          userReminders
            .sort((a, b) => (dayjs(a.expiration).isBefore(b.expiration) ? -1 : 1))
            .map((reminder) => ({
              name: reminder.reminder,
              value: `<t:${dayjs(reminder.expiration).unix()}:R>\nDestination:${
                reminder.destination === 'dm' ? 'In your DMs' : `<#${reminder.destination}>`
              }`,
            }))
        ),
      ],
    });
  },
});
