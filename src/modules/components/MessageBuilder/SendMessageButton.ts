import { cache } from '$lib/cache';
import { colors, icons } from '$lib/db';
import { t } from '$lib/language';
import { MessageBuilderTypes, RolePickerData } from '$lib/types/messageBuilder';
import { MessageEmbed } from 'discord.js';
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
        new MessageEmbed()
          .setAuthor({
            name: strings.SUCCESS_TITLE,
            iconURL: icons.success,
          })
          .setDescription(strings.SUCCESS_DESCRIPTION)
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });

    cache.del(`${type}_BUILDER:${this.guildId}`);
  },
});
