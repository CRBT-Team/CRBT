import { GuildMember } from 'discord.js';

export function activities(member: GuildMember) {
  const acts = [];
  if (!member.presence || member.presence.status.match(/offline|invisible/)) return null;
  for (const activity of member.presence.activities.values()) {
    switch (activity.type) {
      case 'STREAMING':
        acts.push(`Streaming **[${activity.name}](${activity.url})** on **${activity.details}**`);
        break;

      case 'LISTENING':
        if (activity.name === 'Spotify')
          acts.push(
            `<:spotify:771863394709536768> **[${activity.details}](https://open.spotify.com/track/${activity.syncId})**`
          );
        else acts.push(`Listening to **${activity.name}**`);
        break;

      case 'PLAYING':
        // if (activity.state) acts.push(`**${activity.name}**, ${activity.state}`);
        acts.push(`${activity.name}`);
        break;

      case 'WATCHING':
        acts.push(`Watching ${activity.name}`);
        break;
      case 'COMPETING':
        acts.push(`Competing in ${activity.name}`);
        break;
    }
  }
  return acts;
}
