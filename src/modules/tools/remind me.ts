import { colors, db, emojis } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { setReminder } from '$lib/functions/setReminder';
import { Reminder } from '$lib/types/CRBT/Reminder';
import dayjs, { Dayjs } from 'dayjs';
import { GuildTextBasedChannel, Message, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'remind me',
  description: 'Sets a reminder for the specified user.',
  options: new OptionBuilder()
    .string('when', 'The time to remind the user (e.g. 2 hours, 3w2d, 20:30).', true)
    .string('subject', 'Whatever you need to be reminded about.', true)
    .channel('destination', 'Where the reminder should go (leave blank to send a DM).'),
  async handle({ when, subject, destination }) {
    const now = dayjs();
    const w = when
      .trim()
      .replaceAll('and', '')
      .replace('at', '')
      .replace('on', '')
      .replace('in', '')
      .trim()
      .replaceAll('  ', ' ');

    console.log(w);
    let expiration: Dayjs;
    let timeMS: number;

    if (w.trim().toLowerCase().startsWith('today') || when.trim().toLowerCase().startsWith('at')) {
      const time = w.split(' ').length === 1 ? null : w.split(' ').slice(1).join('');
      expiration = time
        ? dayjs(`${now.format('YYYY-MM-DD')}T${convertTime12to24(time)}Z`)
        : now.add(30, 'm');
      timeMS = expiration.diff(now);
    }
    if (w.trim().toLowerCase().startsWith('tomorrow')) {
      const tomorrow = now.add(1, 'day');
      const time = w.split(' ').length === 1 ? null : w.split(' ').slice(1).join('');
      // console.log(time);
      expiration = !!time
        ? dayjs(`${tomorrow.format('YYYY-MM-DD')}T${convertTime12to24(time)}Z`)
        : tomorrow;
      // console.log(expiration);
      timeMS = tomorrow.diff(now);
    }

    if (!ms(w) && dayjs(w).isValid()) {
      if (dayjs(w).isAfter(now)) {
        expiration = dayjs(w);
        timeMS = expiration.diff(now);
      } else {
        return this.reply(
          CRBTError('You cannot set a reminder for a time in the past.', 'Time traveling?')
        );
      }
    } else if (!!ms(w) && !dayjs(w).isValid()) {
      timeMS = ms(w);
      expiration = now.add(timeMS, 'ms');
    }

    if (!expiration || !timeMS || timeMS < 0) {
      return this.reply(
        CRBTError('The time you entered is in an invalid format, or below 0 seconds.')
      );
    }
    if (timeMS > ms('2y')) {
      return this.reply(CRBTError('You cannot set a reminder for more than 2 years from now.'));
    }

    if (destination) {
      const channel = destination as GuildTextBasedChannel;
      if (!channel) {
        return this.reply(
          CRBTError('The channel you specified is not a valid text channel.', 'Invalid channel')
        );
      } else if (!channel.permissionsFor(this.user).has('SEND_MESSAGES')) {
        return this.reply(
          CRBTError('You do not have permission to send messages in that channel.', 'No permission')
        );
      } else if (!channel.permissionsFor(this.guild.me).has('SEND_MESSAGES')) {
        return this.reply(
          CRBTError('I do not have permission to send messages in that channel.', 'No permission')
        );
      }
    }
    const userReminders = await db.reminders.findMany({
      where: { user_id: this.user.id },
    });

    if (userReminders.length >= 5) {
      return this.reply(CRBTError('You can only have 5 reminders at a time.'));
    }

    await this.deferReply();

    const reminder: Reminder = {
      destination: destination ? destination.id : 'dm',
      expiration: expiration.toISOString(),
      reminder: subject,
      user_id: this.user.id,
      url: ((await this.fetchReply()) as Message).url.replace('https://discord.com/channels/', ''),
    };

    const expUnix = expiration.unix();

    try {
      await setReminder(reminder);

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.success} Reminder set!`)
            .setDescription(
              (destination
                ? `You will be reminded in ${destination}`
                : 'You will be reminded by DM') +
                `\n` +
                (expiration.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
                  ? `Today at <t:${expUnix}:T> • <t:${expUnix}:R>.`
                  : expiration.format('YYYY-MM-DD') === now.add(1, 'day').format('YYYY-MM-DD')
                  ? `Tomorrow at <t:${expUnix}:T> • <t:${expUnix}:R>.`
                  : `<t:${expUnix}> • <t:${expUnix}:R>.`)
            )
            .addField('Subject', subject)
            .setColor(`#${colors.success}`),
        ],
      });
    } catch (error) {
      await this.editReply(UnknownError(this, String(error)));
    }
  },
});

const convertTime12to24 = (time12h: string) => {
  const [time, modifier] = time12h.toLowerCase().split(/ |p|a/);

  let [hours, minutes]: (string | number)[] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (time12h.toLowerCase().endsWith('pm')) {
    hours = parseInt(hours, 10) + 12;
  }

  return minutes ? `${hours}:${minutes}` : `${hours}:00`;
};
