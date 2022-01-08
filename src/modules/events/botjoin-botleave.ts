import { colors, illustrations, links } from '$lib/db';
import { MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export const botLeave = OnEvent('guildDelete', async (guild) => {
  ((await guild.client.channels.fetch('926077264884559913')) as TextChannel).send({
    embeds: [{ title: `Left ${guild.name} - ${guild.id}`, color: `#${colors.error}` }],
  });
});

export const botJoin = OnEvent('guildCreate', async (guild) => {
  console.log(guild);

  ((await guild.client.channels.fetch('926077264884559913')) as TextChannel).send({
    embeds: [{ title: `Joined ${guild.name} - ${guild.id}`, color: `#${colors.success}` }],
  });

  if (guild.systemChannel.permissionsFor(guild.client.user).has('SEND_MESSAGES')) {
    guild.systemChannel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(`Thanks for inviting ${guild.client.user.username} to your server!`)
          .setDescription(
            `${guild.client.user.username} is now in ${guild.client.guilds.cache.size} servers!` +
              '\n' +
              'To get started with CRBT, simply type `/` and click its avatar!' +
              '\n' +
              `For more help and info, visit our **[support server](${links.discord})**`
          )
          .setImage(illustrations.welcome)
          .setColor(`#${colors.default}`),
      ],
    });
  }
});
