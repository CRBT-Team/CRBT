import { formatMessage } from '$lib';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'hello',
  description: 'Say hello',
  options: new OptionBuilder().string('name', 'who do you want to say hello to', false),
  async handle(opts) {
    this.reply({
      embeds: [formatMessage(`Hello ${opts.name ?? 'world'}!`)],
    });
  },
});
