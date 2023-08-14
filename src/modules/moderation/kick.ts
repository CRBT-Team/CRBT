import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { GuildMember } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { ModerationAction, ModerationContext, handleModerationAction } from './_base';

export default ChatCommand({
  name: 'kick',
  description: 'Kick a server member.',
  nameLocalizations: getAllLanguages('KICK', localeLower),
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
    }),
  handle({ user, reason }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      user: this.user,
      target: user,
      type: ModerationAction.UserKick,
      reason,
    });
  },
});

export function kick(member: GuildMember, { reason }: ModerationContext) {
  member.kick(reason);
}
