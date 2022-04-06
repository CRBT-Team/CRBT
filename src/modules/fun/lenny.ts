import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { webhookSend } from '$lib/functions/webhookSend';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'lenny',
  description: 'Appends ( ͡° ͜ʖ ͡°) to your message.',
  options: new OptionBuilder().string('message', 'Your message.'),
  async handle({ message }) {
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }
    const content = message ? `${message} ( ͡° ͜ʖ ͡°)` : '( ͡° ͜ʖ ͡°)';

    await this.deferReply();
    try {
      await webhookSend(this, content).then(() => this.deleteReply());
    } catch (e) {
      await this.editReply(UnknownError(this, String(e)));
    }
  },
});
