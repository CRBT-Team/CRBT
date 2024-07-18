import { prisma } from '$lib/db';
import { clients, servers } from '$lib/env';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { AnyTimeout, TimeoutTypes } from '$lib/types/timeouts';
import { APIApplicationCommand, Routes } from 'discord-api-types/v10';
import { ApplicationCommand, Client, Collection } from 'discord.js';
import { OnEvent, getRestClient } from 'purplet';
import { economyCommands } from '../economy/_helpers';
import { fetch } from 'undici';

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

  await loadEconomyCommands(client);

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
  if (client.user.id !== clients.crbt.id) {
    const guilds = await prisma.guild.findMany({
      where: {
        modules: {
          economy: true,
        },
      },
      include: { economy: { include: { items: true } } },
    });

    return await Promise.all(
      guilds.map(async (guild) => {
        const discordGuild = await client.guilds.fetch(guild.id);
        const urlParams = new URLSearchParams();
        urlParams.set('with_localizations', 'true');

        const commands = (await getRestClient().get(
          Routes.applicationGuildCommands(client.user.id, guild.id),
          {
            query: urlParams,
          },
        )) as Partial<APIApplicationCommand>[];

        Object.entries(economyCommands).forEach(([name, command]) => {
          if (!guild.economy.items.length && name === 'shop') return;

          commands.push({
            ...command.getMeta({
              plural: guild.economy.currencyNamePlural,
              singular: guild.economy.currencyNameSingular,
            }),
            guild_id: guild.id,
            default_member_permissions: null,
            type: 1,
            application_id: client.user.id,
            nsfw: false,
          });
        });

        await fetch(
          `https://discord.com/api/v10/applications/${client.user.id}/guilds/${guild.id}/commands`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(commands),
          },
        );

        console.log(`Posted ${commands.length} on ${discordGuild.name ?? guild.id}`);
      }),
    );
  }
}
