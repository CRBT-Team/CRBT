import { avatar } from '$lib/functions/avatar';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'lenny',
  description: 'Appends ( ͡° ͜ʖ ͡°) to your message.',
  options: new OptionBuilder().string('message', 'Your message.'),
  async handle({ message }) {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.channel.isText()) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.guild.me.permissionsIn(this.channel).has(PermissionFlagsBits.ManageWebhooks, true)) {
      return this.reply(CRBTError('I do not have the "Manage Webhooks" permission.'));
    }

    if (message && message.length > 4096) {
      return this.reply(
        CRBTError(`（＞人＜；） Your message is too long. Make it under 4096 characters.`)
      );
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
