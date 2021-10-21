import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'hello',
  description: 'Sends an hello world',
  options: new OptionBuilder().string('name', 'Name a person', false),
  async handle(opts) {
    this.reply("hello world")
  }
});