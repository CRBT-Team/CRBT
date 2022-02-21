import { avatar } from '$lib/functions/avatar';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { webhookSend } from '$lib/functions/webhookSend';
import { Util } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'reverse',
  description: 'Reverses your message.',
  options: new OptionBuilder().string('message', 'Your message.', true),
  async handle({ message }) {
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }
    const content = Util.cleanContent(message, this.channel).split('').reverse().join('');

    await this.deferReply();
    try {
      await webhookSend(
        this,
        content,
        this.user.username.split('').reverse().join(''),
        avatar(this.user)
      ).then(() => this.deleteReply());
    } catch (e) {
      await this.editReply(UnknownError(this, String(e)));
    }
  },
});
