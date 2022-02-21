import { CommandInteraction, TextChannel, Webhook } from 'discord.js';
import { avatar } from './avatar';

export const webhookSend = async (
  i: CommandInteraction,
  content: string,
  username?: string,
  avatarURL?: string
) => {
  try {
    const webhooks = await (i.channel as TextChannel).fetchWebhooks();

    const hook: Webhook =
      webhooks.find((hook) => hook.name === 'CRBT Webhook' && hook.owner.id === i.client.user.id) ??
      (await (i.channel as TextChannel).createWebhook('CRBT Webhook').then((hook) => hook));

    return await hook.send({
      avatarURL: avatarURL ?? avatar(i.user),
      username: username ?? i.user.username,
      content,
    });
  } catch (e) {
    throw new Error(String(e));
  }
};
