import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { webhookSend } from '$lib/functions/webhookSend';
import { Util } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'shout',
  description: 'SHOUTS YOUR MESSAGE!!!.',
  options: new OptionBuilder().string('message', 'YOUR MESSAGE!!!', true),
  async handle({ message }) {
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }
    const content = `**${Util.cleanContent(message, this.channel).toUpperCase()}!!!**`;

    await this.deferReply();
    try {
      await webhookSend(this, content, this.user.username.toUpperCase()).then(() =>
        this.deleteReply()
      );
    } catch (e) {
      await this.editReply(UnknownError(this, String(e)));
    }
  },
});
