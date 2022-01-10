import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { TextChannel, Util } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'shout',
  description: 'SHOUTS YOUR MESSAGE!!!.',
  options: new OptionBuilder().string('message', 'YOUR MESSAGE!!!', true),
  async handle({ message }) {
    if (this.channel.type !== 'DM') {
      const content = `**${Util.cleanContent(message, this.channel).toUpperCase()}!!!**`;

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
          username: this.user.username.toUpperCase(),
          content,
        });
        await this.deleteReply();
      } catch (e) {
        await this.editReply(CRBTError(this, String(e)));
      }
    } else {
      this.reply(CRBTError(this, 'This command cannot be used in DMs.'));
    }
  },
});
