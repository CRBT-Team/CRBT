import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { formatUsername } from '$lib/functions/formatUsername';
import { t } from '$lib/language';
import { LowBudgetMessage } from '$lib/timeouts/handleReminder';
import { Reminder, ReminderTypes } from '@prisma/client';
import { Client, GuildTextBasedChannel } from 'discord.js';

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

  const channel = (await client.channels
    .fetch(channelId)
    .catch((e) => null)) as GuildTextBasedChannel;

  const guild = channel?.guild || { id: '@me' };

  const user = await client.users.fetch(reminder.userId).catch((e) => null);

  const url = `https://discord.com/channels/${guild.id}/${channel?.id ?? channelId}/${messageId}`;
  const details: LowBudgetMessage = reminder.details ? JSON.parse(reminder.details) : null;

  const author = details
    ? client.users.cache.get(details.authorId) ??
      (await client.users.fetch(details.authorId).catch((e) => null))
    : null;

  return {
    ...reminder,
    raw: reminder,
    subject: getReminderSubject(reminder, client),
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
