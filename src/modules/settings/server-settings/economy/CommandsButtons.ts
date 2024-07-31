import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { Routes } from 'discord-api-types/v10';
import { ButtonComponent, components, getRestClient, row } from 'purplet';
import { economyCommands } from '../../../economy/_helpers';
import { getGuildSettings, saveServerSettings } from '../_helpers';
import { guildFeatureSettings } from '../settings';
import { colors, emojis } from '$lib/env';

export const ToggleEconomyButton = ButtonComponent({
  async handle(isEnabled: boolean) {
    await this.deferUpdate();

    await this.editReply({
      embeds: [
        {
          title: `${emojis.pending} Loading (this may take up to a minute)...`,
          description:
            (isEnabled ? `Removing economy commands...` : `Adding economy commands...`) +
            `\nDo not dismiss this message until the process is done.`,
          color: colors.yellow,
        },
      ],
      components: components(
        ...this.message.components.map((r) =>
          row().addComponents(r.components.map((b) => ({ ...b, disabled: true }))),
        ),
      ),
    });

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
        await this.editReply(await guildFeatureSettings.call(this, EditableGuildFeatures.economy)),
    );
  },
});

export const RefreshCommandsButton = ButtonComponent({
  async handle() {
    await this.deferUpdate();

    await this.editReply({
      embeds: [
        {
          title: `${emojis.pending} Loading (this may take up to a minute)...`,
          description: `Refreshing commands...`,
          color: colors.yellow,
        },
      ],
      components: components(
        ...this.message.components.map((r) =>
          row().addComponents(r.components.map((b) => ({ ...b, disabled: true }))),
        ),
      ),
    });

    // await Promise.all([
    //   removeEconomyGuildCommands(this.guildId, this.applicationId),
    //   addEconomyGuildCommands(this.guildId, this.applicationId),
    // ]).then(
    //   async () =>
    //     await this.editReply(await guildFeatureSettings.call(this, EditableGuildFeatures.economy)),
    // );
  },
});

async function addEconomyGuildCommands(guildId: string, applicationId: string) {
  const {
    economy: { categories, currencyNamePlural, currencyNameSingular },
  } = await getGuildSettings(guildId);
  const promises: Promise<any>[] = [];

  Object.entries(economyCommands).map(([name, command]) => {
    if (!categories.length && name === 'shop') {
      return;
    }

    const commandMeta = command.getMeta({
      plural: currencyNamePlural,
      singular: currencyNameSingular,
    });

    promises.push(
      getRestClient().post(Routes.applicationGuildCommands(applicationId, guildId), {
        body: commandMeta,
      }),
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
      getRestClient().delete(Routes.applicationGuildCommand(applicationId, guildId, command.id)),
    ),
  );

  return promises;
}
