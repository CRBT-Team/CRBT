import { links } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
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
import { getBadgeEmojis } from './user_info';
import { getTabs, navBar, NavBarContext } from './_navbar';

// export default
// ChatCommand({
//   name: 'bot info',
//   description: 'Get info on a given Discord bot, or stats about CRBT if no bot is given.',
//   options: new OptionBuilder().user('bot', 'What bot to get info on. Defaults to CRBT.'),
//   async handle({ bot }) {
//     bot = bot || this.client.user;

//     if (!bot.bot) {
//       return CRBTError(
//         this,
//         `This command only works on bot users. To get a regular user's info, run ${slashCmd(
//           'user info'
//         )}.`
//       );
//     }

//     const isSelf = bot.id === this.client.user.id;

//     const bots = !this.guild
//       ? null
//       : cache.get<Integration[]>(`${this.guild.id}:integrations`) ??
//         (await this.guild.fetchIntegrations()).filter(({ type }) => type === 'discord').toJSON();

//     if (bots) {
//       cache.set<Integration[]>(`${this.guild.id}:integrations`, bots);
//     }

//     const botInfo = isSelf
//       ? await this.client.application.fetch()
//       : bots.find(({ application }) => application.bot.id === bot.id);

//     if (!botInfo) {
//       await CRBTError(
//         this,
//         "Couldn't find that bot on the server. Make sure that it is on the server."
//       );
//     }

//     await this.reply(
//       await renderBotInfo.call(
//         this,
//         {
//           targetId: bot.id,
//           userId: this.user.id,
//         },
//         botInfo
//       )
//     );
//   },
// });

export async function renderBotInfo(
  this: Interaction,
  navCtx: NavBarContext,
  integration: Integration | ClientApplication
) {
  const isSelf = integration.id === this.client.user.id || integration instanceof ClientApplication;
  const app = isSelf ? (integration as ClientApplication) : integration.application;
  const bot = app instanceof IntegrationApplication ? app.bot : this.client.user;

  console.log(integration);

  const userBadges = [
    ...getBadgeEmojis(bot.flags.bitfield),
    (integration as Integration).application,
  ];
  const uptime = new Date(Date.now() - this.client.uptime);
  const i18n = new Intl.NumberFormat(this.locale);

  const { strings } = t(this, 'crbt info');
  const color =
    this instanceof ButtonInteraction ? this.message.embeds[0].color : await getColor(this.user);

  const fields: EmbedFieldData[] = [
    {
      name: 'ID',
      value: app.id,
      inline: true,
    },
  ];

  if (this.guild && !isSelf) {
    fields.push({
      name: 'Added by',
      value: integration.user.toString(),
      inline: true,
    });
  }

  if (!isSelf && integration.role) {
    fields.push({
      name: 'Managed role',
      value: integration.role.toString(),
    });
  }

  fields.push({
    name: t(this, 'CREATED_ON'),
    value: `${timestampMention(app.createdAt)} • ${timestampMention(app.createdAt, 'R')}`,
    inline: true,
  });

  if (isSelf) {
    fields.push(
      {
        name: t(this, 'UPTIME'),
        value: `${timestampMention(uptime)} • ${timestampMention(uptime, 'R')}`,
        inline: true,
      },
      {
        name: strings.MEMBER_COUNT,
        value: i18n.format(this.client.users.cache.size),
        inline: true,
      },
      {
        name: strings.SERVER_COUNT,
        value: i18n.format(this.client.guilds.cache.size),
        inline: true,
      },
      {
        name: t(this, 'PING'),
        value: `${strings.PING_RESULT.replace(
          '{PING}',
          `${Date.now() - this.createdTimestamp}`
        )} • ${slashCmd('ping')}`,
        inline: true,
      }
    );
  }

  return {
    embeds: [
      {
        author: {
          name: `${bot.username} - Bot info`,
          iconURL: bot.avatarURL(),
        },
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
      row(
        ...(!isSelf
          ? [
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'ADD_TO_SERVER'))
                .setURL(
                  `https://discord.com/api/oauth2/authorize?client_id=${bot.id}&scope=applications.commands%20bot&permissions=0`
                ),
            ]
          : [
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'ADD_TO_SERVER'))
                .setURL(links.invite),
              new MessageButton().setStyle('LINK').setLabel(t(this, 'DONATE')).setURL(links.donate),
              new MessageButton()
                .setStyle('LINK')
                .setLabel(t(this, 'DISCORD_SERVER'))
                .setURL(links.discord),
            ])
      ),
      navBar(navCtx, this.locale, 'botinfo', getTabs('botinfo', bot.toJSON(), true as any))
    ),
  };
}
