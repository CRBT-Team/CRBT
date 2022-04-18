import { colors, db, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { row } from '$lib/functions/row';
import { setReminder } from '$lib/functions/setReminder';
import { getStrings } from '$lib/language';
import dayjs, { Dayjs } from 'dayjs';
import {
  GuildTextBasedChannel,
  Message,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder } from 'purplet';

const { meta } = getStrings('en-US')['remind me'];

export default ChatCommand({
  ...meta,
  options: new OptionBuilder()
    .string('when', meta.options[0].description, true)
    .string('subject', meta.options[1].description, true)
    .channel('destination', meta.options[2].description),
  async handle({ when, subject, destination }) {
    const {
      strings,
      errors,
      keywordsDetection__KEEPLOWERCASE: keywords,
    } = getStrings(this.locale)['remind me'];

    dayjs.locale(this.locale);

    if (subject.length > 120) {
      return this.reply(CRBTError(errors.SUBJECT_MAX_LENGTH));
    }

    const now = dayjs();
    const w = when
      .trim()
      .replaceAll(keywords.AND, '')
      .replace(keywords.AT, '')
      .replace(keywords.ON, '')
      .replace(keywords.IN, '')
      .trim()
      .replaceAll('  ', ' ');

    // console.log(w);
    let expiration: Dayjs;
    let timeMS: number;

    if (
      w.trim().toLowerCase().startsWith(keywords.TODAY) ||
      when.trim().toLowerCase().startsWith('at')
    ) {
      const time = w.split(' ').length === 1 ? null : w.split(' ').slice(1).join('');
      expiration = time
        ? dayjs(`${now.format('YYYY-MM-DD')}T${convertTime12to24(time)}Z`)
        : now.add(30, 'm');
      timeMS = expiration.diff(now);
    }
    if (w.trim().toLowerCase().startsWith(keywords.TOMORROW)) {
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
        return this.reply(CRBTError(errors.PAST));
      }
    } else if (!!ms(w) && !dayjs(w).isValid()) {
      timeMS = ms(w);
      expiration = now.add(timeMS, 'ms');
    }

    if (!expiration || !timeMS || timeMS < 0) {
      return this.reply(CRBTError(errors.INVALID_FORMAT));
    }
    if (timeMS > ms('2y')) {
      return this.reply(CRBTError(errors.TOO_LONG));
    }

    if (destination) {
      const channel = destination as GuildTextBasedChannel;
      if (!channel) {
        return this.reply(CRBTError(errors.INVALID_CHANNEL_TYPE));
      } else if (!channel.permissionsFor(this.user).has('SEND_MESSAGES')) {
        return this.reply(CRBTError(errors.USER_MISSING_PERMS));
      } else if (!channel.permissionsFor(this.guild.me).has('SEND_MESSAGES')) {
        return this.reply(CRBTError(errors.BOT_MISSING_PERMS));
      }
    }
    const userReminders = await db.reminders.findMany({
      where: { user_id: this.user.id },
    });

    if (userReminders.length >= 5) {
      return this.reply(CRBTError(errors.REMINDERS_MAX_LIMIT));
    }

    await this.deferReply();

    const reminder = {
      destination: destination ? destination.id : 'dm',
      expiration: expiration.toDate(),
      reminder: subject,
      locale: this.locale,
      user_id: this.user.id,
      url: ((await this.fetchReply()) as Message).url.replace('https://discord.com/channels/', ''),
    };

    const expUnix = expiration.unix();

    try {
      //@ts-ignore
      await setReminder(reminder);

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.SUCCESS_TITLE,
              iconURL: icons.success,
            })
            .setDescription(
              (destination
                ? strings.SUCCESS_CHANNEL.replace('<CHANNEL>', `${destination}`)
                : strings.SUCCESS_DM) +
                `\n` +
                (expiration.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
                  ? strings.TODAY_AT.replace('<TIME>', `<t:${expUnix}:T> • <t:${expUnix}:R>`)
                  : expiration.format('YYYY-MM-DD') === now.add(1, 'day').format('YYYY-MM-DD')
                  ? strings.TOMORROW_AT.replace('<TIME>', `<t:${expUnix}:T> • <t:${expUnix}:R>`)
                  : `<t:${expUnix}> • <t:${expUnix}:R>.`)
            )
            .addField(strings.SUBJECT, subject)
            .setColor(`#${colors.success}`),
        ],
        components: components(
          row(
            new MessageButton()
              .setStyle('LINK')
              .setLabel(strings.BUTTON_GCALENDAR)
              .setURL(
                `https://calendar.google.com/calendar/render?${new URLSearchParams({
                  action: 'TEMPLATE',
                  text: subject,
                  dates: `${expiration.format('YYYYMMDD')}/${expiration
                    .add(1, 'day')
                    .format('YYYYMMDD')}`,
                  details: `${strings.GCALENDAR_EVENT} ${
                    destination && destination?.isText()
                      ? strings.GCALENDAR_EVENT_CHANNEL.replace(
                          '<CHANNEL>',
                          `#${(destination as TextChannel).name}`
                        ).replace('<SERVER>', (destination as TextChannel).guild.name)
                      : strings.GCALENDAR_EVENT_DM
                  }`,
                  location: ((await this.fetchReply()) as Message).url,
                })}`
              )
          )
        ),
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
