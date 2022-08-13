import { cache } from '$lib/cache';
import { MessageBuilderData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { SelectMenuComponent } from 'purplet';
import { MessageBuilder } from '.';

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(type: MessageBuilderTypes) {
    const value = this.values[0];

    const data = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    const builder = MessageBuilder({
      data: {
        ...data,
        embed: {
          ...data.embed,
          color: parseInt(value, 16),
        },
      },
      interaction: this,
    });

    this.update(builder);
  },
});
