import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { isValidTime, ms } from '$lib/functions/ms';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildMember } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction } from './_base';

export default ChatCommand({
  name: 'ban',
  description: 'Ban a chosen user from this server.',
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to ban.', { required: true })
    .string('reason', 'The reason for the ban.', {
      maxLength: 256,
    })
    .integer('delete_messages', 'The number of messages to delete.')
    .string('duration', 'Temporarily ban the user for a specified time.', {
      autocomplete({ duration }) {
        return timeAutocomplete.call(this, duration, '5y', '1m');
      },
    }),
  async handle(opts) {
    const { user, reason, delete_messages, duration } = opts;

    if (duration && !isValidTime(duration) && ms(duration) > ms('3y')) {
      return CRBTError(this, 'Invalid duration or exceeds 3 years');
    }

    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.BanMembers)) {
      return CRBTError(this, 'You do not have permission to ban members.');
    }
    if (!hasPerms(this.appPermissions, PermissionFlagsBits.BanMembers)) {
      return CRBTError(this, 'I do not have permission to ban members.');
    }
    if (this.user.id === user.id) {
      return CRBTError(this, 'You cannot ban yourself! (╯°□°）╯︵ ┻━┻');
    }
    if (!this.guild.members.cache.has(user.id)) {
      return CRBTError(this, 'The user is not in this server.');
    }

    if (this.guild.ownerId === user.id) {
      return CRBTError(this, 'You cannot ban the owner of the server.');
    }

    const member = this.guild.members.cache.get(user.id);

    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'You cannot ban a user with a roles above yours.');
    }
    if (
      this.client.user.id !== this.guild.ownerId &&
      this.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return CRBTError(this, 'I cannot ban a user with roles above mine.');
    }

    if (!isValidTime(duration)) {
      return CRBTError(this, 'Invalid duration.');
    }

    try {
      await member.ban({
        days: delete_messages,
        reason,
      });

      await handleModerationAction.call(this, {
        guild: this.guild,
        moderator: this.user,
        target: opts.user,
        type: duration ? 'BAN' : 'TEMPBAN',
        expiresAt: duration ? new Date(Date.now() + ms(duration)) : null,
        reason,
      });

      if (duration) {
        // TODO: add that as well
        // dbTimeout({
        //   type: TimeoutTypes.TempBan,
        //   expiration: new Date(Date.now() + ms(duration)),
        //   id: this.guildId,
        //   locale: this.guildLocale,
        //   data: {
        //     userId: user.id,
        //     guildId: this.guildId,
        //     reason,
        //   },
        // });
      }
    } catch (e) {
      return this['replied' ? 'editReply' : 'reply'](UnknownError(this, e));
    }
  },
});
