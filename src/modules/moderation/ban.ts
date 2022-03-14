import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'ban',
  description: 'Bans a chosen user from the server.',
  options: new OptionBuilder()
    .user('user', 'The user to ban.')
    .string('reason', 'The reason for the ban.')
    .string('delete_messages', 'The number of messages to delete.')
    .string('duration', 'Temporarily bans the user for a specified time.'),
  async handle({ user, delete_messages, duration, reason }) {
    await this.guild.members.ban(user, {
      days: parseInt(delete_messages),
      reason,
    });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle('User Banned')
          .setDescription(`${user.tag} has been banned from the server.`),
      ],
    });
  },
});
