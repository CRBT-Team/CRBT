import { PollData } from '$lib/types/timeouts';
import { Client, TextChannel } from 'discord.js';
import { endPoll } from '../../modules/polls/poll';

export async function handlePoll(poll: PollData, client: Client) {
  const [channelId, messageId] = poll.id.split('/');
  const channel = client.channels.cache.get(channelId) as TextChannel;
  const msg = channel ? await channel.messages.fetch(messageId).catch(() => null) : undefined;
  if (!msg) return;

  endPoll(poll.data, msg, poll.locale);
}
