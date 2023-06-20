import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { createCRBTError } from '$lib/functions/CRBTError';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { getAllLanguages, t } from '$lib/language';
import { GuildMember, Interaction } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction, ModerationContext } from './_base';

export default ChatCommand({
  name: 'ban',
  nameLocalizations: getAllLanguages('BAN', localeLower),
  description: 'Ban a server member.',
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', t('en-US', 'USER_TYPE_COMMAND_OPTION_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('USER', localeLower),
      descriptionLocalizations: getAllLanguages('USER_TYPE_COMMAND_OPTION_DESCRIPTION'),
      required: true,
    })
    .string('reason', t('en-US', 'REASON_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('REASON', localeLower),
      descriptionLocalizations: getAllLanguages('REASON_DESCRIPTION'),
      maxLength: 256,
    })
    .integer('delete_messages', 'The amount of messages to delete.')
    .string('end_date', 'When their ban expires, optionally.', {
      nameLocalizations: getAllLanguages('END_DATE', localeLower),
      autocomplete({ end_date }) {
        return timeAutocomplete.call(this, end_date, '10y', '1m');
      },
    }),
  handle({ delete_messages, end_date, reason, user }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      moderator: this.user,
      target: user,
      type: 'BAN',
      expiresAt: end_date ? new Date(Date.now() + ms(end_date)) : null,
      reason,
      duration: end_date,
      messagesDeleted: delete_messages,
    });
  },
});

export function ban(
  this: Interaction,
  member: GuildMember,
  { duration, reason, messagesDeleted }: ModerationContext
) {
  if (duration && !isValidTime(duration) && ms(duration) > ms('10y')) {
    return createCRBTError(
      this,
      t(this, 'ERROR_INVALID_DURATION', {
        relativeTime: '10 years',
      })
    );
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
