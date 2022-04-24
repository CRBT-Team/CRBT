import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { TextChannel, Webhook } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import avatar from '../info/avatar';

export default ChatCommand({
  name: 'lenny',
  description: 'Appends ( ͡° ͜ʖ ͡°) to your message.',
  options: new OptionBuilder().string('message', 'Your message.'),
  async handle({ message }) {
    if (this.channel.type !== 'GUILD_TEXT') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }

    const content = message ? `${message} ( ͡° ͜ʖ ͡°)` : '( ͡° ͜ʖ ͡°)';

    await this.deferReply();

    try {
      const webhooks = await (this.channel as TextChannel).fetchWebhooks();

      const hook: Webhook =
        webhooks.find(
          (hook) => hook.name === 'CRBT Webhook' && hook.owner.id === this.client.user.id
        ) ??
        (await (this.channel as TextChannel).createWebhook('CRBT Webhook').then((hook) => hook));

      await hook.send({
        avatarURL: avatar(this.user),
        username: this.user.username,
        content,
      });

      await this.deleteReply();
    } catch (error) {
      await this.editReply(UnknownError(this, error));
    }
  },
});
