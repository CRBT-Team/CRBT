import { MessageButton } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'bub',
  description: 'bub',
  async handle() {
    this.reply({
      components: components(
        row(new MessageButton().setCustomId('bub').setLabel('bub').setStyle('PRIMARY'))
      ),
    });
  },
});
