import { OnEvent } from 'purplet';
import { newItemCache } from './CreateItemPart1';
import { handleCreateItemPart2 } from './CreateItemPart2';

export const roleSelectMenuCustomId = 'hroleSelectMenu';

export const RoleSelectMenuEvent = OnEvent('interactionCreate', async (i) => {
  if (!(i.isRoleSelect() && i.customId.startsWith(roleSelectMenuCustomId))) return;

  const isSetup = i.customId.endsWith('setup');

  if (isSetup) {
    const newData = {
      ...newItemCache.get(i.message.id),
      value: i.roles.first().id,
    };

    console.log(newData.value);

    newItemCache.set(i.message.id, newData);

    await handleCreateItemPart2.call(i);
  }
});
