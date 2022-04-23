import { CommandInteraction, Message, TextChannel, Webhook } from 'discord.js';

export const webhookSend = async (
  i: CommandInteraction | Message,
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
      avatarURL,
      username,
      content,
    });
  } catch (e) {
    throw new Error(String(e));
  }
};
