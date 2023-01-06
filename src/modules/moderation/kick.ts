import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages } from '$lib/language';
import { GuildMember } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction, ModerationContext } from './_base';

export default ChatCommand({
  name: 'kick',
  description: 'Kick a server member.',
  nameLocalizations: getAllLanguages('KICK', localeLower),
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'Who to kick.', {
      nameLocalizations: getAllLanguages('USER', localeLower),
      required: true,
    })
    .string('reason', 'More context for the Moderation History.', {
      nameLocalizations: getAllLanguages('REASON', localeLower),
      maxLength: 256,
    }),
  handle({ user, reason }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      moderator: this.user,
      target: user,
      type: 'KICK',
      reason,
    });
  },
});

export function kick(member: GuildMember, { reason }: ModerationContext) {
  member.kick(reason);
}
