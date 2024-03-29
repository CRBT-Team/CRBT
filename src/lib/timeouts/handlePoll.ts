import { Poll } from '@prisma/client';
import { Client, TextChannel } from 'discord.js';
import { endPoll } from '../../modules/polls/functions/endPoll';

export async function handlePoll(poll: Poll, client: Client) {
  const [channelId, messageId] = poll.id.split('/');
  const channel = client.channels.cache.get(channelId) as TextChannel;
  const msg = channel ? await channel.messages.fetch(messageId).catch(() => null) : undefined;
  if (!msg) return;

  endPoll(poll, msg);
}
