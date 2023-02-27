import { t } from '$lib/language';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { EditPollModal } from './EditPollModal';

export const EditPollButton = ButtonComponent({
  async handle(msgId: string) {
    const msg = (await this.channel.messages.fetch(msgId)).embeds[0];

    const modal = new EditPollModal(msgId).setTitle(t(this, 'EDIT')).setComponents(
      row(
        new TextInputComponent()
          .setCustomId('poll_title')
          .setLabel(t(this, 'TITLE'))
          .setMaxLength(120)
          .setValue(msg.title)
          .setRequired(true)
          .setStyle('PARAGRAPH')
      ),
      ...msg.fields.map((field, index) =>
        row(
          new TextInputComponent()
            .setCustomId(`poll_option_${index}`)
            .setLabel(`${t(this, 'CHOICE')} ${index + 1}`)
            .setValue(field.name.split(' • ').slice(0, -1).join(' • '))
            .setRequired(true)
            .setMaxLength(40)
            .setStyle('SHORT')
        )
      )
    );

    await this.showModal(modal);
  },
});
