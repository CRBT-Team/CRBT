import { GuildMember } from 'discord.js';

export function customStatus(member: GuildMember) {
  const status = member.presence.activities.find((a) => a.type === 'CUSTOM');
  if (!status) return null;
  else return status.emoji ? `${status.emoji} ${status.state}` : status.state;
}
