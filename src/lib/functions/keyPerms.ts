import { Permissions } from 'discord.js';

export function keyPerms(perms: Permissions) {
  return perms
    .toArray()
    .map((perm) => {
      switch (perm) {
        // General Server Permissions
        case 'MANAGE_CHANNELS':
          return 'Manage Channels';
        case 'MANAGE_ROLES':
          return 'Manage Roles';
        case 'MANAGE_EMOJIS_AND_STICKERS':
          return 'Manage Expressions (emoji, stickers & sounds)';
        case 'VIEW_AUDIT_LOG':
          return 'View Audit Log';
        case 'VIEW_GUILD_INSIGHTS':
          return 'View Server Insights';
        case 'MANAGE_WEBHOOKS':
          return 'Manage Webhooks';
        case 'MANAGE_GUILD':
          return 'Manage Server';

        // Membership Permissions
        case 'CREATE_INSTANT_INVITE':
          return 'Create Invite';
        case 'CHANGE_NICKNAME':
          return 'Change Nickname';
        case 'MANAGE_NICKNAMES':
          return 'Manage Nicknames';
        case 'KICK_MEMBERS':
          return 'Kick Members';
        case 'BAN_MEMBERS':
          return 'Ban Members';
        case 'MODERATE_MEMBERS':
          return 'Timeout Members';

        // Text Channel Permissions
        case 'MENTION_EVERYONE':
          return '**Mention @‎everyone, @‎here, and All Roles**';
        case 'MANAGE_MESSAGES':
          return 'Manage Messages';
        case 'MANAGE_THREADS':
          return 'Manage Threads';

        // Voice Channel Permissions
        case 'START_EMBEDDED_ACTIVITIES':
          return 'Use Activities';
        case 'PRIORITY_SPEAKER':
          return 'Priority Speaker';
        case 'MUTE_MEMBERS':
          return 'Mute Members';
        case 'DEAFEN_MEMBERS':
          return 'Deafen Members';
        case 'MOVE_MEMBERS':
          return 'Move Members';

        // Events Permissions
        case 'MANAGE_EVENTS':
          return 'Manage Events';

        default:
          return null;
      }
    })
    .filter((perm) => perm);
}
