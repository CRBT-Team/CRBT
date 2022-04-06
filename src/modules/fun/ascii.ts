import { UnknownError } from '$lib/functions/CRBTError';
import { webhookSend } from '$lib/functions/webhookSend';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'ascii',
  description: 'Sends your message as ASCII art.',
  options: new OptionBuilder().string('message', 'The message to convert to ASCII art.', true),
  async handle({ message }) {
    const req = await fetch(`https://artii.herokuapp.com/make?text=${encodeURIComponent(message)}`);
    const res = await req.text();

    await this.deferReply();

    try {
      await webhookSend(this, res);
      this.deleteReply();
    } catch (e) {
      await this.editReply(UnknownError(this, String(e)));
    }
  },
});
