import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildMember } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction } from './_base';

export default ChatCommand({
  name: 'kick',
  description: 'Kick a chosen user from this server.',
  nameLocalizations: getAllLanguages('KICK', localeLower),
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to kick.', {
      nameLocalizations: getAllLanguages('USER', localeLower),
      required: true,
    })
    .string('reason', 'The reason for the kick.'),
  async handle({ user, reason }) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.KickMembers)) {
      return CRBTError(this, 'You do not have permission to kick members.');
    }
    if (!hasPerms(this.appPermissions, PermissionFlagsBits.KickMembers)) {
      return CRBTError(this, 'I do not have permission to kick members.');
    }
    if (this.user.id === user.id) {
      return CRBTError(this, 'You cannot kick yourself! (╯°□°）╯︵ ┻━┻');
    }
    if (!this.guild.members.cache.has(user.id)) {
      return CRBTError(this, 'The user is not in this server.');
    }
    const member = this.guild.members.cache.get(user.id);
    if (this.guild.ownerId === user.id) {
      return CRBTError(this, 'You cannot kick the owner of the server.');
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'You cannot kick a user with roles above yours.');
    }
    if (
      this.client.user.id !== this.guild.ownerId &&
      this.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'I cannot kick a user with roles above mine.');
    }

    try {
      await member.kick(reason);

      await handleModerationAction.call(this, {
        guild: this.guild,
        moderator: this.user,
        target: user,
        type: 'KICK',
        reason,
      });
    } catch (e) {
      return this['replied' ? 'editReply' : 'reply'](UnknownError(this, e));
    }
  },
});
