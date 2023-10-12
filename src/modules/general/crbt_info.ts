import { colors, emojis, links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { getAllLanguages, t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import { MessageButton } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import pjson from '../../../package.json';

export default ChatCommand({
  name: 'crbt info',
  description: t('en-US', 'crbt info.meta.description'),
  descriptionLocalizations: getAllLanguages('crbt info.meta.description'),
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    const { user } = this.client;
    const ping = Date.now() - this.createdTimestamp;
    const onlineSince = new Date(Date.now() - this.client.uptime);
    const created = user.createdAt;

    await this.editReply({
      embeds: [
        {
          author: {
            name: `${user.username} - ${t(this, 'BOT_INFO')}`,
            iconURL: avatar(user),
            url: links.baseURL,
          },
          description: `**[CRBT v${pjson.version}](${
            links.github
          })** • **[Purplet ${pjson.dependencies['purplet'].slice(1)}](${links.purplet})**`,
          fields: [
            {
              name: t(this, 'MEMBERS'),
              value: this.client.users.cache.size.toLocaleString(this.locale),
              inline: true,
            },
            {
              name: t(this, 'SERVERS'),
              value: this.client.guilds.cache.size.toLocaleString(this.locale),
              inline: true,
            },
            {
              name: t(this, 'PING'),
              value: `≈${ping.toLocaleString(this.locale)}ms (${slashCmd('ping')})`,
              inline: true,
            },
            {
              name: t(this, 'UPTIME'),
              value: `${timestampMention(onlineSince)} • ${timestampMention(onlineSince, 'R')}`,
              inline: true,
            },
            {
              name: t(this, 'CREATED_ON'),
              value: `${timestampMention(created)} • ${timestampMention(created, 'R')}`,
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
            .setLabel(t(this, 'ADD_TO_SERVER'))
            .setURL(links.invite)
            .setEmoji(emojis.buttons.add),
          new MessageButton().setStyle('LINK').setLabel(t(this, 'WEBSITE')).setURL(links.baseURL),
          new MessageButton()
            .setStyle('LINK')
            .setLabel(t(this, 'DISCORD_SERVER'))
            .setURL(links.discord),
        ),
      ),
    });
  },
});
