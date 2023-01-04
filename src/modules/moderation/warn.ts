import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages } from '$lib/language';
import { TextInputComponent } from 'discord.js';
import { ChatCommand, ModalComponent, OptionBuilder, row, UserContextCommand } from 'purplet';
import { handleModerationAction } from './_base';

export default ChatCommand({
  name: 'warn',
  description: "Warn a chosen user. This will add a strike to the user's moderation history.",
  nameLocalizations: getAllLanguages('WARN', localeLower),
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to warn.', {
      nameLocalizations: getAllLanguages('USER', localeLower),
      required: true,
    })
    .string('reason', 'The reason for warning.', {
      maxLength: 256,
    }),
  handle({ user, reason }) {
    return handleModerationAction.call(this, {
      guild: this.guild,
      moderator: this.user,
      target: user,
      type: 'WARN',
      reason,
    });
  },
});

export const CtxCommand = UserContextCommand({
  name: 'Warn User',
  async handle(user) {
    return this.showModal(
      new WarnModal(user.id)
        .setTitle(`Warn ${user.tag}`)
        .setComponents(
          row(
            new TextInputComponent()
              .setCustomId('REASON')
              .setLabel('Reason for warning')
              .setMaxLength(256)
              .setRequired(true)
              .setStyle('PARAGRAPH')
          )
        )
    );
  },
});

export const WarnModal = ModalComponent({
  async handle(userId: string) {
    const reason = this.fields.getTextInputValue('REASON');
    const user = await this.client.users.fetch(userId);

    return await handleModerationAction.call(this, {
      guild: this.guild,
      moderator: this.user,
      target: user,
      type: 'WARN',
      reason,
    });
  },
});
