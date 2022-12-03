import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleModerationAction } from './_base';

export default ChatCommand({
  name: 'clear',
  description: 'Clear a number of messages from this channel.',
  allowInDMs: false,
  options: new OptionBuilder()
    .integer('amount', 'The number of messages to delete.', {
      required: true,
    })
    .string('reason', 'The reason for clearing the channel.'),
  async handle({ amount, reason }) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageMessages)) {
      return CRBTError(this, 'You do not have permission to manage messages.');
    }
    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageMessages)) {
      return CRBTError(this, 'I do not have permission to manage messages.');
    }
    if (amount > 100 || amount < 1) {
      return CRBTError(this, 'You can only delete between 1 and 100 messages.');
    }

    try {
      const getMessages = await (this.channel as GuildTextBasedChannel).messages.fetch({
        limit: amount,
      });

      await this.deferReply();

      const { size: messagesDeleted } = await (this.channel as GuildTextBasedChannel).bulkDelete(
        getMessages,
        false
      );

      console.log(getMessages.map((m) => m.content));

      await handleModerationAction.call(this, {
        guild: this.guild,
        moderator: this.user,
        target: this.channel,
        type: 'CLEAR',
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
      return this['replied' ? 'editReply' : 'reply'](UnknownError(this, e));
    }
  },
});
