import { cache } from '$lib/cache';
import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { MessageBuilderTypes, RolePickerData } from '$lib/types/messageBuilder';
import { ButtonComponent } from 'purplet';

export const SendMessageButton = ButtonComponent({
  async handle(type: MessageBuilderTypes.rolePicker) {
    let data = cache.get<RolePickerData>(`${type}_BUILDER:${this.guildId}`);

    const { strings } = t(this.locale, 'role-selectors');

    data.components[0].components.forEach((c) => {
      c.disabled = false;
    });

    await this.channel.send({
      content: data.content,
      embeds: [data.embed],
      components: data.components,
    });

    await this.update({
      embeds: [
        {
          title: `${emojis.success} ${strings.SUCCESS_TITLE}`,
          description: strings.SUCCESS_DESCRIPTION,
          color: colors.success,
        },
      ],
      components: [],
    });

    cache.del(`${type}_BUILDER:${this.guildId}`);
  },
});
