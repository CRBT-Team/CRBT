import { avatar } from '$lib/functions/avatar';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'lenny',
  description: 'Appends ( ͡° ͜ʖ ͡°) to your message.',
  allowInDMs: false,
  options: new OptionBuilder().string('message', 'Your message.', {
    maxLength: 4096,
  }),
  async handle({ message }) {
    if (!hasPerms(this.guild.me.permissionsIn(this.channel), PermissionFlagsBits.ManageWebhooks)) {
      return this.reply(CRBTError('I do not have the "Manage Webhooks" permission.'));
    }

    const content = message ? `${message} ( ͡° ͜ʖ ͡°)` : '( ͡° ͜ʖ ͡°)';

    await this.deferReply();

    try {
      const channel = this.channel as TextChannel;
      const hooks = await channel.fetchWebhooks();

      let hook = hooks.find(
        ({ name, owner }) => name === 'CRBT Webhook' && owner.id === this.client.user.id
      );

      if (!hook) {
        hook = await channel.createWebhook('CRBT Webhook');
      }

      const avatarURL = avatar(this.user, 64);

      await hook.send({
        avatarURL,
        username: this.user.username,
        content,
      });

      await this.deleteReply();
    } catch (error) {
      await this.editReply(UnknownError(this, error));
    }
  },
});
