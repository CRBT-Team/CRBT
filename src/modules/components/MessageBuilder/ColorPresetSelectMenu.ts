import { MessageEmbed } from 'discord.js';
import { SelectMenuComponent } from 'purplet';

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const value = this.values[0];

    this.update({
      embeds: [new MessageEmbed(this.message.embeds[0]).setColor(`#${value}`)],
    });
  },
});
