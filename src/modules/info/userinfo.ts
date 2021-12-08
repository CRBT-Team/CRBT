import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'hello',
  description: 'Sends an hello world (with an optional name)',
  options: new OptionBuilder().user('name', 'Name you want to use', false),
  async handle() {
    const user = this.options.getUser('name') ?? this.user;
    await this.reply(`hello `);
  },
});
