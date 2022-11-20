import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import { ChatCommand } from 'purplet';

const { meta } = t('en-US', 'ping');

export default ChatCommand({
  name: 'ping',
  description: meta.description,
  async handle() {
    await this.deferReply();

    const { strings } = t(this, 'ping');

    setTimeout(async () => {
      const uptime = dayjs().subtract(this.client.uptime).unix();
      await this.editReply({
        embeds: [
          {
            author: {
              name: strings.EMBED_TITLE.replace('{CRBT}', this.client.user.username),
              iconURL: avatar(this.client.user, 64),
            },
            fields: [
              {
                name: strings.WEBSOCKET,
                value: `${this.client.ws.ping}ms`,
                inline: true,
              },
              {
                name: strings.INTERACTION,
                value: `${Date.now() - this.createdTimestamp}ms`,
                inline: true,
              },
              {
                name: strings.UPTIME,
                value: `<t:${uptime}> (<t:${uptime}:R>)`,
              },
            ],
            color: await getColor(this.user),
          },
        ],
      });
    }, 300);
  },
});
