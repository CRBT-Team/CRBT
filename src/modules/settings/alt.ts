import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'alt',
  description: "Mark yourself or another user as another person's account.",
  options: new OptionBuilder().user(
    'user',
    "User to mark as another person's account. Leave blank to mark yourself."
  ),
  async handle({ user }) {},
});
