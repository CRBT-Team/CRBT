import { colors, links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import { MessageButton } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import pjson from '../../../package.json';

const { meta } = t('en-US', 'crbt info');

export default ChatCommand({
  name: 'crbt info',
  description: meta.description,
  async handle() {
    await this.deferReply();

    const { strings } = t(this, 'crbt info');

    const { user } = this.client;
    const uptime = this.client.uptime;
    const created = user.createdAt;

    await this.editReply({
      embeds: [
        {
          author: {
            name: `${user.username} - Bot info`,
            iconURL: avatar(this.client.user),
            url: links.baseURL,
          },
          description: `Running v${pjson.version} • **[Purplet ${pjson.dependencies[
            'purplet'
          ].slice(1)}](${links.purplet})**`,
          fields: [
            {
              name: strings.MEMBER_COUNT,
              value: this.client.users.cache.size.toLocaleString(this.locale),
              inline: true,
            },
            {
              name: strings.SERVER_COUNT,
              value: this.client.guilds.cache.size.toLocaleString(this.locale),
              inline: true,
            },
            {
              name: strings.PING,
              value: `${strings.PING_RESULT.replace(
                '<PING>',
                `${Date.now() - this.createdTimestamp}`
              )} (\`/ping\`)`,
              inline: true,
            },
            {
              name: strings.CREATED,
              value: `${timestampMention(created)} • ${timestampMention(created, 'R')}`,
              inline: true,
            },
            {
              name: strings.UPTIME,
              value: `${timestampMention(uptime)} • ${timestampMention(uptime, 'R')}`,
              inline: true,
            },
          ],
          thumbnail: {
            url: avatar(user),
          },
          color: colors.default,
        },
      ],
      components: components(
        row(
          new MessageButton()
            .setStyle('LINK')
            .setEmoji('❤️')
            .setLabel(strings.BUTTON_DONATE)
            .setURL(links.donate),
          new MessageButton()
            .setStyle('LINK')
            .setLabel(strings.BUTTON_WEBSITE)
            .setURL('https://crbt.app'),
          new MessageButton().setStyle('LINK').setLabel(strings.BUTTON_INVITE).setURL(links.invite),
          new MessageButton()
            .setStyle('LINK')
            .setLabel(strings.BUTTON_DISCORD)
            .setURL(links.discord)
        )
      ),
    });
  },
});