import { APIUser } from 'discord-api-types/v10';
import { GuildMember } from 'discord.js';

export function formatUsername(user: APIUser) {
  return user.discriminator === '0' ? user.username : `${user.username}#${user.discriminator}`;
}

export function formatDisplayName(user: APIUser, member: GuildMember) {
  return `${
    member?.nickname
      ? `${member.nickname} (${user.display_name ?? user.username})`
      : user.display_name ?? user.username
  }`;
}
