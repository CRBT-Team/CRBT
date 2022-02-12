import { links, misc } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import pjson from '../../../package.json';

export default ChatCommand({
  name: 'crbt info',
  description: `Gives info about CRBT.`,
  async handle() {
    await this.deferReply();

    const uptime = dayjs().subtract(this.client.uptime).unix();
    const created = dayjs(this.client.user.createdAt).unix();

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${this.client.user.username} - Information`,
            iconURL: avatar(this.client.user),
            url: 'https://crbt.ga',
          })
          .setDescription(
            `Version ${pjson.version} on **[Purplet ${pjson.dependencies['purplet'].slice(
              1
            )}](https://crbt.ga/purplet)**`
          )
          .addFields([
            {
              name: 'Members',
              value: `${
                this.client.user.id === misc.CRBTid
                  ? "Can't get member count"
                  : this.client.users.cache.size.toLocaleString()
              }`,
              inline: true,
            },
            {
              name: 'Servers',
              value: `${this.client.guilds.cache.size.toLocaleString()}`,
              inline: true,
            },
            {
              name: 'Channels',
              value: `${this.client.channels.cache.size.toLocaleString()}`,
              inline: true,
            },
            {
              name: 'Ping',
              value: `≈${Date.now() - this.createdTimestamp} milliseconds (\`/ping\`)`,
            },
            { name: 'Created', value: `<t:${created}> (<t:${created}:R>)` },
            { name: 'Online since', value: `<t:${uptime}> (<t:${uptime}:R>)` },
          ])
          .setThumbnail(avatar(this.client.user))
          .setColor(await getColor(this.user)),
      ],
      components: components(
        row(
          new MessageButton().setStyle('LINK').setLabel('Website').setURL('https://crbt.ga'),
          new MessageButton().setStyle('LINK').setLabel('Add to Server').setURL(links.invite),
          new MessageButton().setStyle('LINK').setLabel('Join the Community').setURL(links.discord)
        )
      ),
    });
  },
});
