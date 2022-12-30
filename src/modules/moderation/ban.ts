import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { createCRBTError } from '$lib/functions/CRBTError';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { getAllLanguages } from '$lib/language';
import { GuildMember, Interaction } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction, ModerationContext } from './_base';

export default ChatCommand({
  name: 'ban',
  nameLocalizations: getAllLanguages('BAN', localeLower),
  description: 'Ban a chosen user from this server.',
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to ban.', {
      nameLocalizations: getAllLanguages('USER', localeLower),
      required: true,
    })
    .string('reason', 'The reason for the ban.', {
      nameLocalizations: getAllLanguages('REASON', localeLower),
      maxLength: 256,
    })
    .integer('delete_messages', 'The number of messages to delete.')
    .string('duration', 'Temporarily ban the user for a specified time.', {
      autocomplete({ duration }) {
        return timeAutocomplete.call(this, duration, '10y', '1m');
      },
    }),
  handle({ delete_messages, duration, reason, user }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      moderator: this.user,
      target: user,
      type: 'BAN',
      expiresAt: duration ? new Date(Date.now() + ms(duration)) : null,
      reason,
      duration,
      messagesDeleted: delete_messages,
    });
  },
});

export function ban(
  this: Interaction,
  member: GuildMember,
  { duration, reason, messagesDeleted }: ModerationContext
) {
  if (duration && !isValidTime(duration) && ms(duration) > ms('3y')) {
    return createCRBTError(this, 'Invalid duration or exceeds 3 years');
  }

  if (!isValidTime(duration)) {
    return createCRBTError(this, 'Invalid duration.');
  }

  member.ban({
    days: messagesDeleted,
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
}
