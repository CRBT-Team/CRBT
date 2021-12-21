import { Permissions } from 'discord.js';

export function keyPerms(perms: Permissions) {
  const permissions = perms
    .toArray()
    .map((perm) => {
      switch (perm) {
        case 'CREATE_INSTANT_INVITE':
          return 'Create Invite';
        case 'KICK_MEMBERS':
          return 'Kick Members';
        case 'BAN_MEMBERS':
          return 'Ban Members';
        case 'CHANGE_NICKNAME':
          return 'Change Server Profile';
        case 'MANAGE_WEBHOOKS':
          return 'Manage Webhooks';
        case 'MANAGE_EMOJIS_AND_STICKERS':
          return 'Manage Emojis & Stickers';
        case 'MANAGE_ROLES':
          return 'Manage Roles';
        case 'MANAGE_NICKNAMES':
          return 'Manage Nicknames';
        case 'MANAGE_CHANNELS':
          return 'Manage Channels';
        case 'MANAGE_GUILD':
          return 'Manage Server';
        case 'MENTION_EVERYONE':
          return '**Mention Everyone**';
        case 'START_EMBEDDED_ACTIVITIES':
          return 'Start Activities';
        case 'VIEW_AUDIT_LOG':
          return 'View Audit Log';
        case 'STREAM':
          return 'Video';
        case 'MUTE_MEMBERS':
          return 'Mute Members';
        case 'DEAFEN_MEMBERS':
          return 'Deafen Members';
        case 'MOVE_MEMBERS':
          return 'Move Members';
        default:
          return null;
      }
    })
    .filter((perm) => perm !== null);
  return permissions;
}
