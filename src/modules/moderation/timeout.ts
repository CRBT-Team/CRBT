import { localeLower } from '$lib/functions/localeLower';
import { ms } from '$lib/functions/ms';
import { getAllLanguages } from '$lib/language';
import { GuildMember } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction, ModerationContext } from './_base';

export default ChatCommand({
  name: 'timeout',
  description: 'Timeout a chosen user from this server.',
  nameLocalizations: getAllLanguages('TIMEOUT', localeLower),
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to timeout.', {
      nameLocalizations: getAllLanguages('USER', localeLower),
      required: true,
    })
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
    .string('reason', 'The reason for timing them out.', {
      nameLocalizations: getAllLanguages('REASON', localeLower),
    }),
  handle({ user, reason, duration }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      moderator: this.user,
      target: user,
      type: 'TIMEOUT',
      expiresAt: new Date(Date.now() + ms(duration)),
      reason,
      duration,
    });
  },
});

export function timeout(member: GuildMember, { duration, reason }: ModerationContext) {
  member.timeout(ms(duration), reason);
}
