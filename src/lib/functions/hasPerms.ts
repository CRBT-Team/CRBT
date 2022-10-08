import { devs } from '$lib/env';
import { GuildMember, PermissionResolvable, Permissions } from 'discord.js';

export function hasPerms(
  memberOrPerms: GuildMember | Readonly<Permissions>,
  perms: PermissionResolvable,
  checkAdmin = true
): boolean {
  if (memberOrPerms instanceof GuildMember) {
    const member = memberOrPerms;
    if (devs.includes(member.id)) return true;
    if (member.id === member.guild.ownerId) return true;

    return member.permissions.has(perms, checkAdmin);
  } else if (memberOrPerms instanceof Permissions) {
    const theperms = memberOrPerms;
    return theperms.has(perms, checkAdmin);
  }
}
