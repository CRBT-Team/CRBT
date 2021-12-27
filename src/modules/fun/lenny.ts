import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { TextChannel, Util } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'lenny',
  description: 'Appends ( ͡° ͜ʖ ͡°) to your message.',
  options: new OptionBuilder().string('message', 'Your message.'),
  async handle({ message }) {
    const content = message
      ? Util.cleanContent(message.trim(), this.channel) + ' ( ͡° ͜ʖ ͡°)'
      : '( ͡° ͜ʖ ͡°)';

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
        username: this.user.username,
        content,
      });
      await this.deleteReply();
    } catch (e) {
      await this.editReply(CRBTError(String(e)));
    }
  },
});
