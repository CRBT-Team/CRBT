import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { TextChannel, Util } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'reverse',
  description: 'Reverses your message.',
  options: new OptionBuilder().string('message', 'Your message.', true),
  async handle({ message }) {
    const content = Util.cleanContent(message, this.channel).split('').reverse().join('');

    await this.deferReply();
    try {
      const webhooks = await ((await this.channel.fetch()) as TextChannel).fetchWebhooks();

      const hook =
        webhooks.find(
          (hook) => hook.name === 'CRBT Webhook' && hook.owner.id === this.client.user.id
        ) ??
        (await ((await this.channel.fetch()) as TextChannel)
          .createWebhook('CRBT Webhook')
          .then((hook) => hook));

      await hook.send({
        avatarURL: avatar(this.user),
        username: this.user.username.split('').reverse().join(''),
        content,
      });
      await this.deleteReply();
    } catch (e) {
      await this.editReply(CRBTError(String(e)));
    }
  },
});
