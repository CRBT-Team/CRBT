import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'ban',
  description: 'Bans a chosen user from the server.',
  options: new OptionBuilder()
    .user('user', 'The user to ban.')
    .string('reason', 'The reason for the ban.')
    .string('deletemessages', 'The number of messages to delete.')
    .string('duration', 'Temporarily bans the user for a specified time.'),
  async handle({ user, deletemessages, duration, reason }) {
    await this.guild.members.ban(user, {
      days: parseInt(deletemessages),
    });
  },
});
