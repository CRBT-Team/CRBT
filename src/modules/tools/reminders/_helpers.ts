import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { formatUsername } from '$lib/functions/formatUsername';
import { t } from '$lib/language';
import { LowBudgetMessage } from '$lib/timeouts/handleReminder';
import { Reminder, ReminderTypes } from '@prisma/client';
import { Client, Guild, GuildTextBasedChannel } from 'discord.js';

export async function getUserReminders(userId: string, force = false) {
  return await fetchWithCache(
    `reminders:${userId}`,
    () =>
      prisma.reminder.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          endDate: 'asc',
        },
      }),
    force,
  );
}

export function getReminderSubject(reminder: Reminder, client: Client, isListString = 1) {
  if (reminder.id.endsWith('BIRTHDAY')) {
    const [userId, username] = reminder.subject.split('-');
    const user = client.users.cache.get(userId);
    return `🎂 ${t(
      reminder.locale,
      isListString ? 'BIRTHDAY_LIST_CONTENT' : 'BIRTHDAY_REMINDER_MESSAGE',
      {
        USER: user ? formatUsername(user) : `${username}`,
      },
    )}`;
  }
  if (reminder.id.startsWith('MESSAGEREMINDER') || reminder.id.startsWith('MSG')) {
    const [username, ...subject] = reminder.subject.split('--');

    return (
      t(reminder.locale, 'REMINDER_MESSAGE_TITLE', {
        user: username,
      }) + (isListString ? `\n${subject.join('--')}` : '')
    );
  }
  return reminder.subject;
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export type ExtractedReminder = Unpromise<ReturnType<typeof extractReminder>>;

export async function extractReminder(reminder: Reminder, client: Client) {
  let id: string;
  let messageId: string;
  let channelId: string;
  let eventId: string;
  let guildId: string;

  if (reminder.type === ReminderTypes.MESSAGE) {
    id = reminder.id.split('-')[1];
    [channelId, messageId] = id.split('/');
  }
  if (reminder.type === ReminderTypes.NORMAL) {
    id = reminder.id;
    [guildId, channelId, messageId] = id.split('/');
  }
  if (reminder.type === ReminderTypes.COMMAND) {
    id = reminder.id;
    [guildId, channelId, messageId] = id.split('/');
  }
  if (reminder.type === ReminderTypes.EVENT) {
    id = reminder.id;
    [guildId, eventId] = id.split('/');
  }

  const channel = channelId
    ? ((await client.channels.fetch(channelId).catch((e) => null)) as GuildTextBasedChannel)
    : null;

  const guild = channel?.guild || (await client.guilds.fetch(guildId)) || { id: '@me' };

  const event =
    reminder.type === ReminderTypes.EVENT && eventId && guild instanceof Guild
      ? await guild.scheduledEvents.fetch(eventId)
      : null;

  const user = await client.users.fetch(reminder.userId).catch((e) => null);

  const url =
    channelId && !event
      ? `https://discord.com/channels/${guild.id}/${channel?.id ?? channelId}/${messageId}`
      : event.url;
  const details: LowBudgetMessage = reminder.details ? JSON.parse(reminder.details) : null;

  const author = details
    ? client.users.cache.get(details.authorId) ??
      (await client.users.fetch(details.authorId).catch((e) => null))
    : null;

  return {
    ...reminder,
    raw: reminder,
    event,
    endDate: event?.scheduledEndAt ?? reminder.endDate,
    subject: event?.name ?? getReminderSubject(reminder, client),
    guildId: guild.id,
    channelId,
    messageId,
    details,
    destination: reminder.destination === 'dm' ? user : channel,
    channel,
    guild,
    user,
    author,
    url,
  };
}

export const EditableReminderTypes: ReminderTypes[] = [ReminderTypes.NORMAL, ReminderTypes.MESSAGE];
