import { SelectMenuComponent } from 'purplet';
import { getGuildSettings } from '../../settings/server-settings/_helpers';
import { renderItem } from '../../settings/server-settings/economy/renderItem';

export const ItemSelectMenu = SelectMenuComponent({
  async handle(mode: 'shop' | 'edit') {
    const id = this.values[0];
    const { economy } = await getGuildSettings(this.guildId);
    const item = economy.items.find((i) => i.id === id);

    await this.update(await renderItem.call(this, item, economy, mode));
  },
});
