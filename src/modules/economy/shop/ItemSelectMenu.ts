import { SelectMenuComponent } from 'purplet';
import { renderItem } from '../../settings/serverSettings/economy/ItemSelectMenu';
import { getSettings } from '../../settings/serverSettings/_helpers';

export const ItemSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = parseInt(this.values[0]);
    const { economy } = await getSettings(this.guildId);
    const item = economy.items.find((i) => i.id === id);

    await this.update(await renderItem.call(this, item, economy, 'shop'));
  },
});
