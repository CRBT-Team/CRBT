import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { ms } from '$lib/functions/ms';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildMember } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction } from './_base';

export default ChatCommand({
  name: 'timeout',
  description: 'Timeout a chosen user from this server.',
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to timeout.', { required: true })
    .string('duration', 'How long they should be timed out for.', {
      choices: {
        '60s': '60 seconds',
        '5m': '5 minutes',
        '10m': '10 minutes',
        '1h': '1 hour',
        '1d': '1 day',
        '1w': '1 week',
        '1m': '1 month',
        '28d': 'Max (28 days)',
      },
      required: true,
    })
    .string('reason', 'The reason for timing them out.'),
  async handle({ user, reason, duration }) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ModerateMembers)) {
      return CRBTError(this, 'You do not have permission to timeout members.');
    }
    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ModerateMembers)) {
      return CRBTError(this, 'I do not have permission to timeout members.');
    }
    if (this.user.id === user.id) {
      return CRBTError(this, 'You cannot timeout yourself! (╯°□°）╯︵ ┻━┻');
    }
    if (!this.guild.members.cache.has(user.id)) {
      return CRBTError(this, 'The user is not in this server.');
    }
    const member =
      this.guild.members.cache.get(user.id) ?? (await this.guild.members.fetch(user.id));
    // if (!member.moderatable) {
    //   return CRBTError(this, 'You cannot timeout this user.');
    // }
    if (member.communicationDisabledUntil) {
      return CRBTError(this, 'This user is already timed out.');
    }
    if (this.guild.ownerId === user.id) {
      return CRBTError(this, 'You cannot timeout the owner of the server.');
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'You cannot timeout a user with roles above yours.');
    }
    if (
      this.client.user.id !== this.guild.ownerId &&
      this.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'I cannot timeout a user with roles above mine.');
    }

    try {
      await member.timeout(ms(duration), reason);

      await handleModerationAction.call(this, {
        guild: this.guild,
        moderator: this.user,
        target: user,
        type: 'TIMEOUT',
        expiresAt: new Date(Date.now() + ms(duration)),
        reason,
      });
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }
  },
});
