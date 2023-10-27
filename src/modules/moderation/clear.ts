import { colors, emojis } from '$lib/env';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { CommandInteraction, GuildTextBasedChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { ModerationAction, ModerationContext, handleModerationAction } from './_base';

export default ChatCommand({
  name: 'clear',
  description: 'Clear messages from this channel.',
  allowInDMs: false,
  options: new OptionBuilder()
    .integer('amount', 'How many messages to delete.', {
      required: true,
      minValue: 1,
      maxValue: 100,
    })
    .string('reason', t('en-US', 'REASON_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('REASON', localeLower),
      descriptionLocalizations: getAllLanguages('REASON_DESCRIPTION'),
      maxLength: 256,
    }),
  handle({ amount, reason }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      user: this.user,
      target: this.channel,
      type: ModerationAction.ChannelMessageClear,
      reason,
      messagesToDelete: amount,
    });
  },
});

export async function clearMessages(
  this: CommandInteraction,
  channel: GuildTextBasedChannel,
  { messagesToDelete }: ModerationContext,
) {
  const getMessages = await channel.messages.fetch({
    // increase by 1 to include the command message
    limit: messagesToDelete + 1,
  });

  const botReplyId = await this.fetchReply().then((r) => r.id);

  const { size: messagesDeleted } = await channel.bulkDelete(
    // spare pinned messages and the command message
    getMessages.filter((msg) => !msg.pinned && msg.id !== botReplyId),
    false,
  );

  await this.editReply({
    embeds: [
      {
        title: `${emojis.success} Successfully deleted ${messagesDeleted} messages`,
        description: 'Deleting this message automatically in a second...',
        color: colors.success,
      },
    ],
  });

  setTimeout(() => this.deleteReply(), 1_000);
}
