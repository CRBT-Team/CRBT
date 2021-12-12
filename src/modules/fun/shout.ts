import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { TextChannel, Util } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'shout',
  description: 'SHOUTS YOUR MESSAGE!!!.',
  options: new OptionBuilder().string('message', 'YOUR MESSAGE!!!', true),
  async handle({ message }) {
    const content = `**${Util.cleanContent(message, this.channel).toUpperCase()}!!!**`;

    await this.deferReply({ ephemeral: true });
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
        username: this.user.username.toUpperCase(),
        content,
      });
      await this.editReply('Sent!');
    } catch (e) {
      await this.editReply(CRBTError(String(e)));
    }
  },
});
