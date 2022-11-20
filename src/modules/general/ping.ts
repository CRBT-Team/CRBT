import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { getAllLanguages, t } from '$lib/language';
import dayjs from 'dayjs';
import { ChatCommand } from 'purplet';

const names = Object.entries(getAllLanguages('PING')).reduce(
  (acc, [lang, value]) => ({
    ...acc,
    [lang]: value.toLocaleLowerCase(lang),
  }),
  {}
);

const descriptions = getAllLanguages('ping.meta.description');

export default ChatCommand({
  name: names['en-US'],
  nameLocalizations: names,
  descriptionLocalizations: descriptions,
  description: descriptions['en-US'],
  async handle() {
    await this.deferReply();

    setTimeout(async () => {
      const uptime = dayjs().subtract(this.client.uptime).unix();
      await this.editReply({
        embeds: [
          {
            author: {
              name: t(this, 'ping.strings.EMBED_TITLE', {
                CRBT: this.client.user.username,
              }),
              iconURL: avatar(this.client.user, 64),
            },
            fields: [
              {
                name: t(this, 'ping.strings.WEBSOCKET'),
                value: `${this.client.ws.ping}ms`,
                inline: true,
              },
              {
                name: t(this, 'ping.strings.INTERACTION'),
                value: `${Date.now() - this.createdTimestamp}ms`,
                inline: true,
              },
              {
                name: t(this, 'ping.strings.UPTIME'),
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
