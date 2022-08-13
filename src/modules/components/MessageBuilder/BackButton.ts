import { cache } from '$lib/cache';
import { MessageBuilderData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { ButtonComponent } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';

export const BackButton = ButtonComponent({
  async handle(type: MessageBuilderTypes) {
    const data = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    const builder = MessageBuilder({
      data,
      interaction: this,
    });

    this.update(builder);
  },
});
