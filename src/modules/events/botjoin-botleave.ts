import { colors, icons, links, misc } from '$lib/db';
import { getStrings } from '$lib/language';
import { MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export const botLeave = OnEvent('guildDelete', async (guild) => {
  (guild.client.channels.cache.get(misc.channels.guildJoinLeave) as TextChannel).send({
    embeds: [{ title: `Left ${guild.name} - ${guild.id}`, color: `#${colors.error}` }],
  });
  guild.client.user.setActivity({
    name: `${guild.client.guilds.cache.size} servers • crbt.ga`,
    type: 'WATCHING',
  });
});

export const botJoin = OnEvent('guildCreate', async (guild) => {
  (guild.client.channels.cache.get(misc.channels.guildJoinLeave) as TextChannel).send({
    embeds: [{ title: `Joined ${guild.name} - ${guild.id}`, color: `#${colors.success}` }],
  });

  guild.client.user.setActivity({
    name: `${guild.client.guilds.cache.size} servers • crbt.ga`,
    type: 'WATCHING',
  });

  const { strings } = getStrings(guild.preferredLocale).crbt_introduction;

  if (guild.systemChannel.permissionsFor(guild.client.user).has('SEND_MESSAGES')) {
    guild.systemChannel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(strings.EMBED_TITLE.replace('<CRBT>', guild.client.user.username))
          .setDescription(
            strings.EMBED_DESCRIPTION.replace('<CRBT>', guild.client.user.username)
              .replace('<SERVERS>', guild.client.guilds.cache.size.toString())
              .replace('<DISCORD>', links.discord)
          )
          .setImage(icons.welcome)
          .setColor(`#${colors.default}`),
      ],
    });
  }
});
