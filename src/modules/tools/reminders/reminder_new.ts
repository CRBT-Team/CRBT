import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { ms } from '$lib/functions/ms';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { getAllLanguages, t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { ReminderTypes } from '@prisma/client';
import dayjs from 'dayjs';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel, Message } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { renderReminder } from './reminder_list';
import { getUserReminders } from './_helpers';

export default ChatCommand({
  name: 'reminder new',
  description: t('en-US', 'remind me.meta.description'),
  descriptionLocalizations: getAllLanguages('remind me.meta.description'),
  options: new OptionBuilder()
    .string('subject', t('en-US', 'remind me.meta.options.1.description' as any), {
      nameLocalizations: getAllLanguages('SUBJECT', localeLower),
      descriptionLocalizations: getAllLanguages('remind me.meta.options.1.description' as any),
      async autocomplete({ subject }) {
        const cachedEvents = this.guild.scheduledEvents.cache;

        const events = (
          cachedEvents.size ? cachedEvents : await this.guild.scheduledEvents.fetch()
        ).filter(
          (event) =>
            event.status !== 'COMPLETED' &&
            event.status !== 'CANCELED' &&
            event.name.toLowerCase().includes(subject.toLowerCase()),
        );

        return events.map((event) => ({
          name: `Discord Event: ${event.name} (${event.scheduledStartAt.toLocaleString(this.locale)})`,
          value: `event=${event.url}`,
        }));
      },
      required: true,
      minLength: 1,
      maxLength: 512,
    })
    .string('when', t('en-US', 'remind me.meta.options.0.description' as any), {
      nameLocalizations: getAllLanguages('remind me.meta.options.0.name' as any, localeLower),
      descriptionLocalizations: getAllLanguages('remind me.meta.options.0.description' as any),
      async autocomplete({ when, subject }) {
        if (subject && subject.startsWith('event=')) {
          const eventUrl = subject.split('=')[1];
          const event = this.guild.scheduledEvents.cache.find((event) => event.url === eventUrl);

          when = event?.scheduledStartAt.toISOString() ?? when;
        }

        return timeAutocomplete.call(this, when, '2y');
      },
      required: true,
    })
    .channel('destination', t('en-US', 'remind me.meta.options.2.description' as any), {
      nameLocalizations: getAllLanguages('REMINDER_DESTINATION', localeLower),
      descriptionLocalizations: getAllLanguages('remind me.meta.options.2.description' as any),
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
    }),
  async handle({ when, subject, destination }) {
    const { errors } = t(this, 'remind me');

    dayjs.locale(this.locale);

    const now = dayjs();
    let endDate: dayjs.Dayjs;

    try {
      endDate = await resolveToDate(when, this.locale);
    } catch (e) {
      return CRBTError(this, errors.INVALID_FORMAT);
    }

    if (endDate.isAfter(now.add(ms('2y1s')))) {
      return CRBTError(
        this,
        t(this, 'ERROR_INVALID_DURATION', {
          relativeTime: '2 years',
        }),
      );
    }

    if (destination) {
      const channel = destination as GuildTextBasedChannel;
      if (!hasPerms(channel.permissionsFor(this.user), PermissionFlagsBits.SendMessages)) {
        return CRBTError(
          this,
          t(this, 'ERROR_MISSING_PERMISSIONS', {
            PERMISSIONS: 'Send Messages',
          }),
        );
      } else if (
        !hasPerms(channel.permissionsFor(this.guild.me), PermissionFlagsBits.SendMessages)
      ) {
        return CRBTError(
          this,
          t(this, 'ERROR_MISSING_PERMISSIONS', {
            PERMISSIONS: 'Send Messages',
          }),
        );
      }
    }
    const userReminders = await prisma.reminder.findMany({
      where: { userId: this.user.id },
    });

    if (userReminders.length >= 10) {
      return CRBTError(this, errors.REMINDERS_MAX_LIMIT);
    }

    await this.deferReply();

    const isEvent = subject.startsWith('event=https://discord.com/events/');

    const msg = await this.fetchReply();
    let url =
      msg instanceof Message
        ? `${msg.guildId ?? '@me'}/${msg.channelId}/${msg.id}`
        : `${msg.guild_id ?? '@me'}/${msg.channel_id}/${msg.id}`;

    if (isEvent) {
      const [guildId, eventId] = subject
        .replace('event=https://discord.com/events/', '')
        .split('/');

      const guild = await this.client.guilds.fetch(guildId);
      const event = await guild.scheduledEvents.fetch(eventId);

      if (!event || event.status === 'COMPLETED' || event.status === 'CANCELED') {
        return CRBTError(this, errors.EVENT_NOT_FOUND);
      }

      subject = event.name;
      url = `${guildId}/${eventId}`;
      endDate = dayjs(event.scheduledStartAt);
    }

    try {
      const reminder = await dbTimeout(TimeoutTypes.Reminder, {
        id: url,
        endDate: endDate.toDate(),
        destination: destination ? destination.id : 'dm',
        userId: this.user.id,
        subject,
        locale: this.locale,
        type: isEvent ? ReminderTypes.EVENT : ReminderTypes.NORMAL,
        details: null,
      });
      await getUserReminders(this.user.id, true);

      await this.editReply({
        content: `${emojis.success} ${t(this, 'remind me.strings.SUCCESS_TITLE', {
          command: slashCmd('reminder list'),
        })}`,
        embeds: (await renderReminder.call(this, reminder)).embeds,
      });
    } catch (error) {
      await this.editReply(UnknownError(this, error));
    }
  },
});
