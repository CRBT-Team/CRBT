import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildMember, GuildMemberRoleManager } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction } from './_base';

export default ChatCommand({
  name: 'warn',
  description: "Warn a chosen user. This will add a strike to the user's moderation history.",
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to warn.', { required: true })
    .string('reason', 'The reason for warning.'),
  async handle({ user, reason }) {
    if (
      !hasPerms(this.memberPermissions, PermissionFlagsBits.ModerateMembers) &&
      !(this.member.roles as GuildMemberRoleManager).cache.find((r) =>
        r.name.toLowerCase().includes('mod')
      )
    ) {
      return CRBTError(
        this,
        'You do not have permission to warn members (Timeout Members permission or Moderator role required).'
      );
    }
    if (this.user.id === user.id) {
      return CRBTError(this, 'You cannot warn yourself! ┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻');
    }
    if (!this.guild.members.cache.has(user.id)) {
      return CRBTError(this, 'The user is not in this server.');
    }
    const member = this.guild.members.cache.get(user.id);
    if (this.guild.ownerId === user.id) {
      return CRBTError(this, 'You cannot warn the owner of the server.');
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'You cannot warn a user with roles above yours.');
    }
    if (
      this.client.user.id !== this.guild.ownerId &&
      this.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'I cannot kick a user with roles above mine.');
    }

    try {
      await handleModerationAction.call(this, {
        guild: this.guild,
        moderator: this.user,
        target: user,
        type: 'WARN',
        reason,
      });
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }
  },
});
