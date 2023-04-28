import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { Routes } from 'discord-api-types/v10';
import { ButtonComponent, getRestClient } from 'purplet';
import { economyCommands } from '../../../src/modules/economy/_helpers';
import { renderFeatureSettings } from '../../../src/modules/settings/server-settings/settings';
import {
  getGuildSettings,
  saveServerSettings,
} from '../../../src/modules/settings/server-settings/_helpers';

export const ToggleEconomyButton = ButtonComponent({
  async handle(isEnabled: boolean) {
    await this.deferUpdate();

    await saveServerSettings(this.guildId, {
      modules: {
        economy: !isEnabled,
      },
    });

    const promises: Promise<any>[] = [];

    if (isEnabled) {
      promises.push(...(await removeEconomyGuildCommands(this.guildId, this.applicationId)));
    } else {
      promises.push(...(await addEconomyGuildCommands(this.guildId, this.applicationId)));
    }

    await Promise.all(promises).then(
      async () =>
        await this.editReply(await renderFeatureSettings.call(this, EditableGuildFeatures.economy))
    );
  },
});

async function addEconomyGuildCommands(guildId: string, applicationId: string) {
  const {
    economy: { categories, currency_name_plural, currency_name_singular },
  } = await getGuildSettings(guildId);
  const promises: Promise<any>[] = [];

  Object.entries(economyCommands).map(([name, command]) => {
    if (!categories.length && name === 'shop') {
      return;
    }

    const commandMeta = command.getMeta({
      plural: currency_name_plural,
      singular: currency_name_singular,
    });

    promises.push(
      getRestClient().post(Routes.applicationGuildCommands(applicationId, guildId), {
        body: commandMeta,
      })
    );
  });

  return promises;
}

async function removeEconomyGuildCommands(guildId: string, applicationId: string) {
  const promises: Promise<any>[] = [];

  const guildCommands = (
    (await getRestClient().get(Routes.applicationGuildCommands(applicationId, guildId))) as any[]
  ).filter((c) => Object.keys(economyCommands).includes(c.name));

  guildCommands.forEach((command) =>
    promises.push(
      getRestClient().delete(Routes.applicationGuildCommand(applicationId, guildId, command.id))
    )
  );

  return promises;
}
