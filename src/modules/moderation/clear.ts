import { prisma } from '$lib/db';
import { colors, icons } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'clear',
  description: 'Clear a number of messages from this channel.',
  allowInDMs: false,
  options: new OptionBuilder().integer('amount', 'The number of messages to delete.', {
    required: true,
  }),
  async handle({ amount }) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageMessages)) {
      return CRBTError(this, 'You do not have permission to manage messages.');
    }
    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageMessages)) {
      return CRBTError(this, 'I do not have permission to manage messages.');
    }
    if (amount > 100 || amount < 1) {
      return CRBTError(this, 'You can only delete between 1 and 100 messages.');
    }

    await this.deferReply();

    try {
      const { size: messagesDeleted } = await (this.channel as GuildTextBasedChannel).bulkDelete(
        amount
      );

      await prisma.moderationStrikes.create({
        data: {
          createdAt: new Date(),
          moderatorId: this.user.id,
          serverId: this.guild.id,
          targetId: this.channel.id,
          type: 'CLEAR',
        },
      });

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Successfully deleted ${messagesDeleted} messages`,
              iconURL: icons.success,
            })
            .setColor(colors.success),
        ],
      });
    } catch (e) {
      return await this[this.replied ? 'editReply' : 'reply'](UnknownError(this, String(e)));
    }
  },
});
