import { EconomyCommand } from '../_helpers';
import { renderCategoryShopPage } from './CategorySelectMenu';
import { renderShopTopSellers } from './TopSellers';
import { ButtonComponent } from 'purplet';
import { getGuildSettings } from '../../settings/server-settings/_helpers';

export const menus = {
  topSellers: renderShopTopSellers,
}

export const shop: EconomyCommand = {
  getMeta() {
    return {
      name: 'shop',
      description: "Access the server's Shop and purchase items!",
    };
  },
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    await this.editReply(await renderShopTopSellers.call(this));
  },
};

export const ShopGoToButton = ButtonComponent({
  async handle({ menu, categoryId }: {
    menu?: keyof typeof menus,
    categoryId?: string
  }) {
    if (categoryId) {
      const { economy } = await getGuildSettings(this.guildId);
      const category = economy.categories.find((c) => c.id === categoryId);

      await this.update(await renderCategoryShopPage.call(this, category, economy));
    }
    else {
      await this.update(await menus[menu].call(this));
    }
  },
});