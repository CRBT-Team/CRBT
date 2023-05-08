import { emojis } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { userMention } from '@purplet/utils';
import { Channel, Message, MessageInteraction, MessageOptions } from 'discord.js';
import { ButtonComponent, row } from 'purplet';

export function ShareResponseBtn(i: { locale: string; channel: Channel }, compact = true) {
  return new ShareResponseBtnShell()
    .setEmoji(emojis.buttons.preview)
    .setLabel(compact ? '' : 'Share result')
    .setStyle('SECONDARY')
    .setDisabled(i.channel.type === 'DM');
}

export const ShareResponseBtnShell = ButtonComponent({
  async handle() {
    const { content, embeds, attachments, components } = this.message as Message;
    const commandName = (this.message.interaction as MessageInteraction).commandName;

    const newMessage: MessageOptions = {
      content: `${userMention(this.user.id)} used ${slashCmd(
        commandName
      )} and shared its result.\n\n${content}`,
      embeds,
      attachments: Array.from(attachments.values()),
      components: components
        .filter((r) => r.components.filter((c) => c.customId !== this.customId).length)
        .map((r) =>
          row().addComponents(
            r.components.filter((b) => b.customId !== this.customId).map((b) => b.setDisabled())
          )
        ),
    };

    await this.channel.send(newMessage);

    await this.update({
      components: components.map((r) =>
        row().addComponents(
          r.components.map((b) => (b.customId === this.customId ? b : b.setDisabled()))
        )
      ),
    });
  },
});
