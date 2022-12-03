import { prisma } from '$lib/db';
import { channels, colors, icons, links } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { AchievementProgress } from '$lib/responses/Achievements';
import dayjs from 'dayjs';
import { MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export const botLeave = OnEvent('guildDelete', async (guild) => {
  (guild.client.channels.cache.get(channels.guildJoinLeave) as TextChannel).send({
    embeds: [{ title: `Left ${guild.name} - ${guild.id}`, color: colors.error }],
  });
  guild.client.user.setActivity({
    name: `${guild.client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  await prisma.statistics.update({
    where: { date: dayjs().startOf('day').toISOString() },
    data: {
      servers: { decrement: 1 },
      members: { decrement: guild.members.cache.size },
    },
  });
});

export const botJoin = OnEvent('guildCreate', async (guild) => {
  (guild.client.channels.cache.get(channels.guildJoinLeave) as TextChannel).send({
    embeds: [{ title: `Joined ${guild.name} - ${guild.id}`, color: colors.success }],
  });

  guild.client.user.setActivity({
    name: `${guild.client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
  });

  const { strings } = t(guild.preferredLocale, 'crbt_introduction');

  if (guild.systemChannel.permissionsFor(guild.client.user).has('SEND_MESSAGES')) {
    guild.systemChannel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(strings.EMBED_TITLE.replace('{CRBT}', guild.client.user.username))
          .setDescription(
            strings.EMBED_DESCRIPTION.replace('{CRBT}', guild.client.user.username)
              .replace('{SERVERS}', guild.client.guilds.cache.size.toString())
              .replace('{DISCORD}', links.discord)
          )
          .setImage(icons.welcome)
          .setColor(await getColor(guild)),
      ],
    });
  }

  const owner = await guild.fetchOwner();

  await prisma.statistics.update({
    where: { date: dayjs().startOf('day').toISOString() },
    data: {
      servers: { increment: 1 },
      members: { increment: guild.members.cache.size },
    },
  });

  await AchievementProgress.call(owner, 'WELCOME_TO_CRBT');
});
