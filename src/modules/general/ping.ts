import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'ping',
  description: t('en-US', 'ping.meta.description'),
  nameLocalizations: getAllLanguages('PING', localeLower),
  descriptionLocalizations: getAllLanguages('ping.meta.description'),
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    setTimeout(async () => {
      const uptime = dayjs().subtract(this.client.uptime);
      await this.editReply({
        embeds: [
          {
            author: {
              name: `${this.client.user.username} - ${t(this, 'PING')}`,
              iconURL: avatar(this.client.user, 64),
            },
            fields: [
              {
                name: t(this, 'WEBSOCKET'),
                value: `${this.client.ws.ping}ms`,
                inline: true,
              },
              {
                name: t(this, 'INTERACTION'),
                value: `${Date.now() - this.createdTimestamp}ms`,
                inline: true,
              },
              {
                name: t(this, 'UPTIME'),
                value: `${timestampMention(uptime)} • ${timestampMention(uptime, 'R')}`,
              },
            ],
            color: await getColor(this.user),
          },
        ],
      });
    }, 300);
  },
});
