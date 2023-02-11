import { channels, colors, icons } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export const botLeave = OnEvent('guildDelete', async (guild) => {
  (guild.client.channels.cache.get(channels.guildJoinLeave) as TextChannel).send({
    embeds: [{ title: `Left ${guild.name} - ${guild.id}`, color: colors.error }],
  });
  guild.client.user.setActivity({
    name: `${guild.client.guilds.cache.size} servers • crbt.app`,
    type: 'WATCHING',
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

  const locale = guild.preferredLocale;

  if (
    guild.systemChannel &&
    guild.systemChannel?.permissionsFor(guild.client.user)?.has('SEND_MESSAGES')
  ) {
    guild.systemChannel.send({
      embeds: [
        {
          title: t(locale, 'crbt_introduction.EMBED_TITLE'),
          description: t(locale, 'crbt_introduction.EMBED_DESCRIPTION', {
            crbt: guild.client.user.username,
            serverCount: guild.client.guilds.cache.size.toLocaleString(locale),
            help: slashCmd('help'),
            settings: slashCmd('settings'),
          }),
          image: {
            url: icons.welcome,
          },
          color: await getColor(guild),
        },
      ],
    });
  }
});
