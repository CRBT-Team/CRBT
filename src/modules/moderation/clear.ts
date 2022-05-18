import { colors, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'clear',
  description: 'Clear a number of messages from this channel.',
  options: new OptionBuilder().integer('amount', 'The number of messages to delete.', {
    required: true,
  }),
  async handle({ amount }) {
    if (!this.memberPermissions.has('MANAGE_MESSAGES')) {
      return this.reply(CRBTError('You do not have permission to manage messages.'));
    }
    if (!this.guild.me.permissions.has('MANAGE_MESSAGES')) {
      return this.reply(CRBTError('I do not have permission to manage messages.'));
    }
    if (amount > 100 || amount < 1) {
      return this.reply(CRBTError('You can only delete between 1 and 100 messages.'));
    }

    try {
      const { size: messagesDeleted } = await this.channel.bulkDelete(amount);

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Successfully deleted ${messagesDeleted} messages`,
              iconURL: icons.success,
            })
            .setColor(`#${colors.success}`),
        ],
      });
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }
  },
});
