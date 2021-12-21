import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'ping',
  description: 'Pings CRBT and sends its latency.',
  async handle() {
    await this.deferReply();

    setTimeout(async () => {
      const uptime = dayjs().subtract(this.client.uptime).unix();
      const ping = {
        msg: this.createdTimestamp - Date.now(),
        ws: this.client.ws.ping,
      };
      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor(`${this.client.user.username} - Ping`, avatar(this.client.user, 64))
            .addFields([
              {
                name: 'WebSocket',
                value: `${ping.ws}ms`,
                inline: true,
              },
              {
                name: 'Message',
                value: `${ping.msg}ms`,
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
