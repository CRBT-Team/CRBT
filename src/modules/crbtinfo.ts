import { avatar, button } from '$lib/functions';
import dayjs from 'dayjs';
import { MessageActionRow, MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'crbtinfo',
  description: 'Gives info about CRBT.',
  async handle() {
    await this.deferReply();

    const uptime = dayjs().subtract(this.client.uptime).unix();
    const created = dayjs(this.client.user.createdAt).unix();

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor(
            `${this.user.username} - Information`,
            avatar(this.client.user),
            'https://crbt.ga'
          )
          .addFields([
            { name: 'Members', value: `${this.client.users.cache.size}`, inline: true },
            { name: 'Servers', value: `${this.client.guilds.cache.size}`, inline: true },
            { name: 'Channels', value: `${this.client.channels.cache.size}`, inline: true },
            { name: 'Created', value: `<t:${created}> (<t:${uptime}:R>)` },
            {
              name: 'Ping',
              value: `≈${this.createdTimestamp - Date.now()} milliseconds (\`/ping\`)`,
            },
            { name: 'Online since', value: `<t:${uptime}> (<t:${uptime}:R>)` },
          ])
          .setThumbnail(avatar(this.client.user))
          .setColor('NAVY'),
      ],
      components: [
        new MessageActionRow().addComponents(
          button('LINK', 'Website', 'https://crbt.ga'),
          button('LINK', 'Invite', 'https://crbt.ga/invite'),
          button('LINK', 'Discord', 'https://crbt.ga/discord'),
          button('LINK', 'GitHub', 'https://crbt.ga/github')
        ),
      ],
    });
  },
});
