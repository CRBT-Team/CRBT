import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { createCRBTError } from '$lib/functions/CRBTError';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { getAllLanguages, t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { GuildMember, Interaction } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { ModerationAction, ModerationContext, handleModerationAction } from './_base';

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
      user: this.user,
      target: user,
      type: end_date ? ModerationAction.UserTemporaryBan : ModerationAction.UserBan,
      endDate: end_date ? new Date(Date.now() + ms(end_date)) : null,
      reason,
      duration: end_date,
      messagesToDelete: delete_messages,
    });
  },
});

export async function ban(
  this: Interaction,
  member: GuildMember,
  { duration, reason, messagesToDelete: messagesDeleted, id }: ModerationContext,
) {
  if (duration && !isValidTime(duration) && ms(duration) > ms('10y')) {
    return createCRBTError(
      this,
      t(this, 'ERROR_INVALID_DURATION', {
        relativeTime: '10 years',
      }),
    );
  }

  await member.ban({
    deleteMessageSeconds: messagesDeleted,
    reason,
  });

  if (duration) {
    await dbTimeout(
      TimeoutTypes.TemporaryBan,
      {
        id,
        endDate: new Date(Date.now() + ms(duration)),
        type: ModerationAction.UserTemporaryBan,
        userId: this.user.id,
        guildId: this.guildId,
        targetId: member.id,
        reason,
      },
      true,
    );
  }
}
