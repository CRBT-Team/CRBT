import { MessageButton, MessageSelectMenu } from 'discord.js';
import { components, row } from 'purplet';
import { getSettings } from '../../settings/serverSettings/_helpers';
import { EconomyCommand } from '../_helpers';

export const shop: EconomyCommand = {
  getMeta() {
    return {
      name: 'shop',
      description: "Access the server's Shop and purchase items!",
    };
  },
  async handle() {
    await this.deferReply();

    const { economy } = await getSettings(this.guildId);

    await this.editReply({
      embeds: [
        {
          author: {
            name: `${this.guild.name} - Shop`,
            icon_url: this.guild.iconURL(),
          },
          description: 'lorem ipsum dolor sit amet and whatever they put here idk',
          image: {
            url: 'https://m.clembs.com/placeholder-image.png',
          },
        },
      ],
      components: components(
        row(
          new MessageButton().setCustomId('recents').setLabel('Recently added').setStyle('PRIMARY'),
          new MessageButton().setCustomId('best').setLabel('Top sellers').setStyle('PRIMARY')
        ),
        row(
          new MessageSelectMenu()
            .setCustomId('categories')
            .setPlaceholder('Categories')
            .setOptions(
              economy.categories.map((c) => ({
                label: c.label,
                emoji: c.emoji,
                value: c.id.toString(),
              }))
            )
        )
      ),
    });
  },
};
