import { colors, db, emojis } from '$lib/db';
import { button } from '$lib/functions/button';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { ms } from '$lib/functions/ms';
import { setLongerTimeout } from '$lib/functions/setLongerTimeout';
import { userDMsEnabled } from '$lib/functions/userDMsEnabled';
import { Reminder } from '$lib/types/CRBT/Reminder';
import dayjs, { Dayjs } from 'dayjs';
import { GuildTextBasedChannel, Message, MessageActionRow, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'remind me',
  description: 'Sets a reminder for the specified user.',
  options: new OptionBuilder()
    .string('when', 'The time to remind the user (e.g. 2 hours, 3w2d, 20:30).', true)
    .string('subject', 'Whatever you need to be reminded about.', true)
    .channel('destination', 'Where the reminder should go (leave blank to send a DM).'),
  async handle({ when, subject, destination }) {
    const w = when
      .trim()
      .replaceAll('and', '')
      .replaceAll('at', '')
      .replaceAll('on', '')
      .replaceAll('in', '')
      .trim();
    let expiration: Dayjs;
    let timeMS: number;

    if (w.trim().toLowerCase().startsWith('today')) {
      const now = dayjs();
      const time = w.split(' ').length === 1 ? null : w.split(' ')[1];
      expiration = time ? dayjs(`${now.format('YYYY-MM-DD')}T${time}Z`) : now.add(30, 'm');
      timeMS = expiration.diff(now);
    }
    if (w.trim().toLowerCase().startsWith('tomorrow')) {
      const tomorrow = dayjs().add(1, 'day');
      const time = w.split(' ').length === 1 ? null : w.split(' ')[1];
      expiration = time ? dayjs(`${tomorrow.format('YYYY-MM-DD')}T${time}Z`) : tomorrow;
      timeMS = tomorrow.diff(dayjs());
    }

    if (!ms(w) && dayjs(w).isValid()) {
      if (dayjs(w).isAfter(dayjs())) {
        expiration = dayjs(w);
        timeMS = expiration.diff(dayjs());
      } else {
        return this.reply(
          CRBTError(this, 'You cannot set a reminder for a time in the past.', 'Time traveling?')
        );
      }
    } else if (!!ms(w) && !dayjs(w).isValid()) {
      timeMS = ms(w);
      expiration = dayjs().add(timeMS, 'ms');
    }

    if (!expiration || !timeMS || timeMS < 0) {
      return this.reply(
        CRBTError(this, 'The time you entered is in an invalid format, or below 0 seconds.')
      );
    }
    if (timeMS > ms('2y')) {
      return this.reply(
        CRBTError(this, 'You cannot set a reminder for more than 2 years from now.')
      );
    }

    //check if the destination is a valid text channel and if both the user & the bot can send messages
    if (destination) {
      const channel = destination as GuildTextBasedChannel;
      if (!channel) {
        return this.reply(
          CRBTError(
            this,
            'The channel you specified is not a valid text channel.',
            'Invalid channel'
          )
        );
      } else if (!channel.permissionsFor(this.user).has('SEND_MESSAGES')) {
        return this.reply(
          CRBTError(
            this,
            'You do not have permission to send messages in that channel.',
            'No permission'
          )
        );
      } else if (!channel.permissionsFor(this.guild.me).has('SEND_MESSAGES')) {
        return this.reply(
          CRBTError(
            this,
            'I do not have permission to send messages in that channel.',
            'No permission'
          )
        );
      }
    }
    const userReminders = (
      await db.from<Reminder>('reminders').select('*').eq('user_id', this.user.id)
    ).body;

    if (userReminders.length >= 5) {
      await this.reply(CRBTError(this, 'You can only have 5 reminders at a time.'));
    }

    await this.deferReply();

    const now = dayjs();
    const reminder: Reminder = {
      destination: destination ? destination.id : 'dm',
      expiration: dayjs().add(timeMS, 'ms'),
      reminder: subject,
      user_id: this.user.id,
      url: ((await this.fetchReply()) as Message).url,
    };
    const req = await db.from<Reminder>('reminders').insert(reminder);

    setLongerTimeout(async () => {
      const dest =
        !destination && userDMsEnabled(this.user)
          ? this.user
          : (destination as GuildTextBasedChannel);
      dest.send({
        content: destination ? `<@${reminder.user_id}>` : null,
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.misc.reminder} Reminder`)
            .setDescription(`Set on <t:${now.unix()}> (<t:${now.unix()}:R>).`)
            .addField('Reminder', reminder.reminder)
            .setColor(await getColor(this.user)),
        ],
        components: [
          new MessageActionRow().addComponents(button('LINK', 'Jump to message', reminder.url)),
        ],
      });
      await db
        .from<Reminder>('reminders')
        .delete()
        .eq('id', req.body[0].id)
        .eq('user_id', this.user.id);
    }, timeMS);

    const expUnix = reminder.expiration.unix();

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.success} Reminder set!`)
          .setDescription(
            (destination
              ? `You will be reminded in ${destination}`
              : userDMsEnabled(this.user)
              ? 'You will be reminded by DM'
              : `Your DMs are currently disabled or you may have block ${this.client.user.username}. Make sure to change your privacy settings so a message can be sent in there. Otherwize, we'll ping you on here.`) +
              `\n` +
              (reminder.expiration.date() === now.date()
                ? `Today at <t:${expUnix}:T> • <t:${expUnix}:R>.`
                : reminder.expiration.date() === now.date() + 1
                ? `Tomorrow at <t:${expUnix}:T> • <t:${expUnix}:R>.`
                : `<t:${expUnix}> • <t:${expUnix}:R>.`)
          )
          .addField('Subject', subject)
          .setColor(`#${colors.success}`),
      ],
    });
  },
});
