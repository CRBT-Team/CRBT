import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'ping',
  description: 'Ping CRBT. Returns latency and connection info.',
  async handle() {
    await this.deferReply();

    setTimeout(async () => {
      const uptime = dayjs().subtract(this.client.uptime).unix();
      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${this.client.user.username} - Ping`,
              iconURL: avatar(this.client.user, 64),
            })
            .addFields([
              {
                name: 'WebSocket',
                value: `${this.client.ws.ping}ms`,
                inline: true,
              },
              {
                name: 'Interaction',
                value: `${Date.now() - this.createdTimestamp}ms`,
                inline: true,
              },
              {
                name: 'Online since',
                value: `<t:${uptime}> (<t:${uptime}:R>)`,
              },
            ])
            .setColor(await getColor(this.user)),
        ],
      });
    }, 300);
  },
});
