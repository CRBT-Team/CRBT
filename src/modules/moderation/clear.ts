import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { ModerationAction, handleModerationAction } from './_base';

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
  async handle({ amount, reason }) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageMessages)) {
      return CRBTError(this, 'You do not have permission to manage messages.');
    }
    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageMessages)) {
      return CRBTError(this, 'I do not have permission to manage messages.');
    }

    try {
      const getMessages = await (this.channel as GuildTextBasedChannel).messages.fetch({
        limit: amount,
      });

      await this.deferReply();

      const { size: messagesDeleted } = await (this.channel as GuildTextBasedChannel).bulkDelete(
        getMessages,
        false,
      );

      await handleModerationAction.call(this, {
        guild: this.guild,
        user: this.user,
        target: this.channel,
        type: ModerationAction.ChannelMessageClear,
        reason,
        messagesDeleted,
      });

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
    } catch (e) {
      return this[this.replied ? 'editReply' : 'reply'](UnknownError(this, e));
    }
  },
});
