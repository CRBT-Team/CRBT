import { LowBudgetMessage } from '$lib/timeouts/handleReminder';
import { TimeoutTypes } from '$lib/types/timeouts';
import { Reminder } from '@prisma/client';
import { Client, GuildTextBasedChannel } from 'discord.js';
import { getReminderSubject } from '../../modules/tools/reminder list';

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export type ExtractedReminder = Unpromise<ReturnType<typeof extractReminder>>;

export async function extractReminder(reminder: Reminder, client: Client) {
  const id = reminder.id.split('-')[0];
  const [guildId, channelId, messageId] = id.split('/');
  const guild = client.guilds.cache.get(guildId);
  const channel = (await client.channels.fetch(channelId)) as GuildTextBasedChannel;
  const user = await client.users.fetch(reminder.userId);
  const url = `https://discord.com/channels/${id}`;
  const details: LowBudgetMessage = reminder.details ? JSON.parse(reminder.details) : null;
  const author = details
    ? client.users.cache.get(details.authorId) ?? (await client.users.fetch(details.authorId))
    : null;

  return {
    ...reminder,
    raw: reminder,
    subject: getReminderSubject(reminder, client),
    guildId,
    channelId,
    messageId,
    details,
    destination: reminder.destination === 'dm' ? user : channel,
    channel,
    guild,
    user,
    author,
    url,
    type: TimeoutTypes.Reminder,
  };
}
