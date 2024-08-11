import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { AnyTimeout, TimeoutTypes } from '$lib/types/timeouts';
import { APIApplicationCommand, Routes } from 'discord-api-types/v10';
import { ApplicationCommand, Client, Collection } from 'discord.js';
import { OnEvent, getRestClient } from 'purplet';
import { economyCommands } from '../economy/_helpers';
import { fetch } from 'undici';
import { deepMerge } from '$lib/functions/deepMerge';
import { defaultGuildSettings } from '../settings/server-settings/_helpers';
import { FullGuildSettings } from '$lib/types/guild-settings';

export let allCommands: Collection<string, ApplicationCommand>;

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  if (client.user.id !== clients.crbt.id) {
    console.log(`Skipping timeouts`);
  } else {
    loadTimeouts(client);
  }

  if (!process.argv.includes('--skip-economy')) {
    await loadEconomyCommands(client);
  }

  allCommands = await client.application.commands.fetch({
    guildId: client.user.id !== clients.crbt.id ? servers.community : undefined,
  });

  console.log(`Loaded ${allCommands.size} commands`);
});

function loadTimeouts(client: Client) {
  Object.values(TimeoutTypes).forEach((type) => {
    (prisma[type as string].findMany() as Promise<AnyTimeout[]>).then((timeouts) => {
      timeouts.forEach((t) => {
        if (!!t.endDate) {
          dbTimeout(type, t, true);
        }
      });
    });
  });
}

async function loadEconomyCommands(client: Client) {
  try {
    // Fetch all guilds with the economy module enabled
    const guilds = (await prisma.guild.findMany({
      where: {
        modules: {
          economy: true,
        },
      },
      include: { economy: { include: { items: true } } },
    })) as FullGuildSettings[];

    return await Promise.all(
      guilds.map(async ({ id, economy }) => {
        economy = deepMerge(defaultGuildSettings.economy, {
          id,
          ...economy,
        });

        const discordGuild = await client.guilds.fetch(economy.id);

        if (!discordGuild) return;

        const urlParams = new URLSearchParams();
        urlParams.set('with_localizations', 'true');

        let commands: Partial<APIApplicationCommand>[] = [];

        if (client.user.id !== clients.crbt.id) {
          commands = (await getRestClient().get(
            Routes.applicationGuildCommands(client.user.id, economy.id),
            {
              query: urlParams,
            },
          )) as Partial<APIApplicationCommand>[];
        }

        Object.entries(economyCommands).forEach(([name, command]) => {
          if (name === 'shop' && !economy.items.length) return;

          commands.push({
            ...command.getMeta({
              plural: economy.currencyNamePlural,
              singular: economy.currencyNameSingular,
            }),
            guild_id: economy.id,
            default_member_permissions: null,
            type: 1,
            application_id: client.user.id,
            nsfw: false,
          });
        });

        // remove commands duplicates
        commands = commands.filter(
          (command, index, self) =>
            index ===
            self.findIndex((t) => t.name === command.name && t.description === command.description),
        );

        const res = await fetch(
          `https://discord.com/api/v10/applications/${client.user.id}/guilds/${economy.id}/commands`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(commands),
          },
        );

        if (!res.ok) {
          console.error(await res.json());
          return;
        }

        console.log(`Posted ${commands.length} commands on ${discordGuild.name ?? economy.id}`);
      }),
    );
  } catch (e) {
    console.error(e);
  }
}
