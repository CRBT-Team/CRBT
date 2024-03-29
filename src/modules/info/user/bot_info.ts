import { links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { timestampMention } from '@purplet/utils';
import {
  ButtonInteraction,
  ClientApplication,
  EmbedFieldData,
  Integration,
  IntegrationApplication,
  Interaction,
  MessageButton,
} from 'discord.js';
import { components, row } from 'purplet';
import pjson from '../../../../package.json';
import { NavBarContext, getTabs, navBar } from './_navbar';
import { getBadgeEmojis } from './user_info';

export async function renderBotInfo(
  this: Interaction,
  navCtx: NavBarContext,
  integration: Integration | ClientApplication,
) {
  const isSelf = integration.id === this.client.user.id || integration instanceof ClientApplication;
  const app = isSelf ? (integration as ClientApplication) : integration.application;
  const bot = app instanceof IntegrationApplication ? app.bot : this.client.user;

  const userBadges = getBadgeEmojis(bot.flags.bitfield);

  const color =
    this instanceof ButtonInteraction ? this.message.embeds[0].color : await getColor(this.user);

  const fields: EmbedFieldData[] = [
    {
      name: t(this, 'ID'),
      value: app.id,
    },
  ];

  if (this.guild && !isSelf) {
    fields.push({
      name: 'Added by',
      value: `${integration.user}`,
      inline: true,
    });
  }

  if (!isSelf && integration.role) {
    fields.push({
      name: 'Managing role',
      value: integration.role.toString(),
    });
  }

  if (isSelf) {
    const ping = Date.now() - this.createdTimestamp;
    const onlineSince = new Date(Date.now() - this.client.uptime);

    fields.push(
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
    );
  }

  fields.push({
    name: t(this, 'CREATED_ON'),
    value: `${timestampMention(app.createdAt)} • ${timestampMention(app.createdAt, 'R')}`,
  });

  return {
    embeds: [
      {
        author: {
          name: `${bot.username} - ${t(this, 'BOT_INFO')}`,
          icon_url: avatar(bot),
          url: isSelf ? links.baseURL : null,
        },
        title: formatUsername(bot),
        description:
          (userBadges.length > 0 ? `${userBadges.join(' ')} ${invisibleChar}\n` : '') +
          app.description,
        fields,
        color,
        thumbnail: {
          url: app.iconURL(),
        },
        footer: {
          text: isSelf
            ? null
            : `CRBT v${pjson.version} • Purplet ${pjson.dependencies['purplet'].slice(1)}`,
        },
      },
    ],
    components: components(
      navBar(navCtx, this.locale, 'botinfo', getTabs('botinfo', bot.toJSON(), true as any)),
      row(
        ...(!isSelf
          ? [
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'ADD_TO_SERVER'))
                .setURL(
                  `https://discord.com/api/oauth2/authorize?client_id=${bot.id}&scope=applications.commands%20bot&permissions=0`,
                ),
            ]
          : [
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'ADD_TO_SERVER'))
                .setURL(links.invite),
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'DISCORD_SERVER'))
                .setURL(links.discord),
            ]),
      ),
    ),
  };
}
