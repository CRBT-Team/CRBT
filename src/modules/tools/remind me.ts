import { db } from '$lib/db';
import { Reminder } from '$lib/types/CRBT/Reminder';
import { MessageEmbed } from 'discord.js';
import ms from 'ms';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'remind me',
  description: 'Sets a reminder for the specified user.',
  options: new OptionBuilder()
    .string('time', 'The time to remind the user.', true)
    .string('reminder', 'Whatever you need to be reminded about.', true),
  async handle({ time, reminder }) {
    if (time.match(/[0-9]*(\s?)(ms|s|h|d|m|w)/gim) && ms(time) < ms('2y')) {
      const userReminders = (
        await db.from<Reminder>('reminders').select('*').eq('user_id', this.user.id)
      ).body;
      if (userReminders.length < 5) {
        const req = await db.from<Reminder>('reminders').insert({
          user_id: this.user.id,
          reminder,
          destination: this.channel.id,
          expiration: new Date(Date.now() + ms(time)),
        });

        setTimeout(async () => {
          this.channel.send({
            embeds: [new MessageEmbed().setTitle('Reminder').setDescription(reminder)],
          });
          await db
            .from<Reminder>('reminders')
            .delete()
            .eq('id', req.body[0].id)
            .eq('user_id', this.user.id);
        }, ms(time));

        await this.reply(
          `Reminder set for ${ms(ms(time), { long: true })} (${new Date(Date.now() + ms(time))})`
        );
      } else {
        await this.reply('You can only have 5 reminders at a time.');
      }
    } else {
      await this.reply('Invalid time format or exceeds 2 years.');
    }
  },
});
