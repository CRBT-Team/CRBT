import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { createCRBTError } from '$lib/functions/CRBTError';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { getAllLanguages, t } from '$lib/language';
import { GuildMember, Interaction } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction, ModerationContext } from './_base';

export default ChatCommand({
  name: 'timeout',
  description: 'Timeout a server member.',
  nameLocalizations: getAllLanguages('TIMEOUT', localeLower),
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', t('en-US', 'USER_TYPE_COMMAND_OPTION_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('USER', localeLower),
      descriptionLocalizations: getAllLanguages('USER_TYPE_COMMAND_OPTION_DESCRIPTION'),
      required: true,
    })
    .string('end_date', 'When should their timeout expire?', {
      nameLocalizations: getAllLanguages('END_DATE', localeLower),
      async autocomplete({ end_date }) {
        return await timeAutocomplete.call(this, end_date, '28d', '1m');
      },
      required: true,
    })
    .string('reason', t('en-US', 'REASON_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('REASON', localeLower),
      descriptionLocalizations: getAllLanguages('REASON_DESCRIPTION'),
      maxLength: 256,
    }),
  handle({ user, reason, end_date }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      moderator: this.user,
      target: user,
      type: 'TIMEOUT',
      expiresAt: new Date(Date.now() + ms(end_date)),
      reason,
      duration: end_date,
    });
  },
});

export function timeout(
  this: Interaction,
  member: GuildMember,
  { duration, reason }: ModerationContext
) {
  if (duration && !isValidTime(duration) && ms(duration) > ms('28d')) {
    return createCRBTError(this, 'Invalid duration or exceeds 28 days');
  }

  member.timeout(ms(duration), reason);
}
