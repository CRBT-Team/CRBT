import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'hello',
  description: 'Sends an hello world (with an optional name)',
  options:
    new OptionBuilder().string('name', 'Name you want to use', false),
  async handle(opts) {
    this.reply('')
  },
});