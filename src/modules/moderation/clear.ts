import { colors, db, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'clear',
  description: 'Clear a number of messages from this channel.',
  options: new OptionBuilder().integer('amount', 'The number of messages to delete.', {
    required: true,
  }),
  async handle({ amount }) {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

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
      const { size: messagesDeleted } = await (this.channel as GuildTextBasedChannel).bulkDelete(
        amount
      );

      await db.moderationStrikes.create({
        data: {
          createdAt: new Date(),
          moderatorId: this.user.id,
          serverId: this.guild.id,
          targetId: this.channel.id,
          type: 'CLEAR',
        },
      });

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
