import { SelectMenuComponent } from 'purplet';
import { renderItem } from '../../../../disabled/settings/economy/renderItem';
import { getGuildSettings } from '../../settings/serverSettings/_helpers';

export const ItemSelectMenu = SelectMenuComponent({
  async handle(mode: 'shop' | 'edit') {
    const id = parseInt(this.values[0]);
    const { economy } = await getGuildSettings(this.guildId);
    const item = economy.items.find((i) => i.id === id);

    await this.update(await renderItem.call(this, item, economy, mode));
  },
});
