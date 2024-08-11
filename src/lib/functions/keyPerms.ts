import { GuildMember, Permissions, Role } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';

export function keyPerms(resolvable: GuildMember | Permissions | Role) {
  const permsBitfield = resolvable instanceof Permissions ? resolvable : resolvable.permissions;

  const keyPermsObject = [
    {
      name: 'Manage Channels',
      bits: PermissionFlagsBits.ManageChannels,
    },
    {
      name: 'Manage Roles',
      bits: PermissionFlagsBits.ManageRoles,
    },
    {
      name: 'Manage Expressions (Emoji, Stickers & Sounds)',
      bits: PermissionFlagsBits.ManageGuildExpressions,
    },
    {
      name: 'View Audit Log',
      bits: PermissionFlagsBits.ViewAuditLog,
    },
    {
      name: 'View Server Insights',
      bits: PermissionFlagsBits.ViewGuildInsights,
    },
    {
      name: 'View Server Monetization Insights',
      bits: PermissionFlagsBits.ViewCreatorMonetizationAnalytics,
    },
    {
      name: 'Manage Webhooks',
      bits: PermissionFlagsBits.ManageWebhooks,
    },
    {
      name: 'Manage Server',
      bits: PermissionFlagsBits.ManageGuild,
    },
    {
      name: 'Create Invite',
      bits: PermissionFlagsBits.CreateInstantInvite,
    },
    {
      name: 'Change Nickname',
      bits: PermissionFlagsBits.ChangeNickname,
    },
    {
      name: 'Manage Nicknames',
      bits: PermissionFlagsBits.ManageNicknames,
    },
    {
      name: 'Manage Threads',
      bits: PermissionFlagsBits.ManageThreads,
    },
    {
      name: '**Mention @‎everyone, @‎here, and All Roles**',
      bits: PermissionFlagsBits.MentionEveryone,
    },
    {
      name: 'Manage Messages',
      bits: PermissionFlagsBits.ManageMessages,
    },
    {
      name: 'Manage Threads',
      bits: PermissionFlagsBits.ManageThreads,
    },
    {
      name: 'Use Activities',
      bits: PermissionFlagsBits.UseEmbeddedActivities,
    },
    {
      name: 'Priority Speaker',
      bits: PermissionFlagsBits.PrioritySpeaker,
    },
    {
      name: 'Mute Members',
      bits: PermissionFlagsBits.MuteMembers,
    },
    {
      name: 'Deafen Members',
      bits: PermissionFlagsBits.DeafenMembers,
    },
    {
      name: 'Move Members',
      bits: PermissionFlagsBits.MoveMembers,
    },
    {
      name: 'Manage Events',
      bits: PermissionFlagsBits.ManageEvents,
    },
    {
      name: 'Kick Members',
      bits: PermissionFlagsBits.KickMembers,
    },
    {
      name: 'Ban Members',
      bits: PermissionFlagsBits.BanMembers,
    },
    {
      name: 'Timeout Members',
      bits: PermissionFlagsBits.ModerateMembers,
    },
  ];

  return keyPermsObject.filter((perm) => permsBitfield.has(perm.bits)).map((perm) => perm.name);
}
