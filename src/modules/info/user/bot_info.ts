import { cache } from '$lib/cache';
import { links } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { timestampMention } from '@purplet/utils';
import {
  ButtonInteraction,
  ClientApplication,
  Integration,
  IntegrationApplication,
  Interaction,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import pjson from '../../../../package.json';
import { getBadgeEmojis } from './user_info';
import { getTabs, navBar, NavBarContext } from './_navbar';

// export default
ChatCommand({
  name: 'bot info',
  description: 'Get info on a given Discord bot, or stats about CRBT if no bot is given.',
  options: new OptionBuilder().user('bot', 'What bot to get info on. Defaults to CRBT.'),
  async handle({ bot }) {
    bot = bot || this.client.user;

    if (!bot.bot) {
      return CRBTError(
        this,
        `This command only works on bot users. To get a regular user's info, run ${slashCmd(
          'user info'
        )}.`
      );
    }

    const isSelf = bot.id === this.client.user.id;

    const bots = !this.guild
      ? null
      : cache.get<Integration[]>(`${this.guild.id}:integrations`) ??
        (await this.guild.fetchIntegrations()).filter(({ type }) => type === 'discord').toJSON();

    if (bots) {
      cache.set<Integration[]>(`${this.guild.id}:integrations`, bots);
    }

    const botInfo = isSelf
      ? await this.client.application.fetch()
      : bots.find(({ application }) => application.bot.id === bot.id);

    if (!botInfo) {
      await CRBTError(
        this,
        "Couldn't find that bot on the server. Make sure that it is on the server."
      );
    }

    await this.reply(
      await renderBotInfo.call(
        this,
        {
          targetId: bot.id,
          userId: this.user.id,
        },
        botInfo
      )
    );
  },
});

export async function renderBotInfo(
  this: Interaction,
  navCtx: NavBarContext,
  integration: Integration | ClientApplication
) {
  const isSelf = integration instanceof ClientApplication;
  const app = isSelf ? integration : integration.application;
  const bot = app instanceof IntegrationApplication ? app.bot : this.client.user;

  const userBadges = getBadgeEmojis(bot.flags);

  const uptime = Math.round((Date.now() - this.client.uptime) / 1000);

  const { strings } = t(this, 'crbt info');

  const color =
    this instanceof ButtonInteraction ? this.message.embeds[0].color : await getColor(this.user);

  const e = new MessageEmbed()
    .setAuthor({
      name: `${bot.username} - Bot info`,
      iconURL: bot.avatarURL(),
    })
    .setDescription(
      (userBadges.length > 0 ? `${userBadges.join(' ')} ${invisibleChar}\n` : '') + app.description
    )
    .addField('ID', app.id, true)
    .setColor(color)
    .setThumbnail(app.iconURL());

  if (this.guild && !isSelf) {
    e.addField('Added by', integration.user.toString(), true);
  }

  e.addField(
    strings.CREATED,
    `${timestampMention(app.createdAt)} • ${timestampMention(app.createdAt, 'R')}`
  );

  if (isSelf) {
    e.addField(strings.UPTIME, `<t:${uptime}> • <t:${uptime}:R>`);
  }

  if (!isSelf && integration.role) {
    e.addField('Managed role', integration.role.toString());
  }

  if (isSelf) {
    e.addField(strings.MEMBER_COUNT, this.client.users.cache.size.toLocaleString(this.locale), true)
      .addField(
        strings.SERVER_COUNT,
        this.client.guilds.cache.size.toLocaleString(this.locale),
        true
      )
      .addField(
        strings.PING,
        `${strings.PING_RESULT.replace(
          '{PING}',
          `${Date.now() - this.createdTimestamp}`
        )} • ${slashCmd('ping')}`,
        true
      )
      .setFooter({
        text: `CRBT v${pjson.version} • Purplet ${pjson.dependencies['purplet'].slice(1)}`,
      });
  }

  return {
    embeds: [e],
    components: components(
      row(
        ...(!isSelf
          ? [
              new MessageButton()
                .setStyle('LINK')
                .setLabel(strings.BUTTON_INVITE)
                .setURL(
                  `https://discord.com/api/oauth2/authorize?client_id=${bot.id}&scope=applications.commands%20bot&permissions=0`
                ),
              // isSelf
              //   ? new MessageButton()
              //       .setStyle('LINK')
              //       .setLabel('Terms of Service')
              //       .setURL(app.termsOfServiceURL)
              //   : null,
              isSelf
                ? new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Privacy Policy')
                    .setURL(links.policy)
                : null,
            ]
          : [
              new MessageButton()
                .setStyle('LINK')
                .setLabel(strings.BUTTON_INVITE)
                .setURL(links.invite),
              new MessageButton()
                .setStyle('LINK')
                .setLabel(strings.BUTTON_DONATE)
                .setURL(links.donate),
              new MessageButton()
                .setStyle('LINK')
                .setLabel(strings.BUTTON_DISCORD)
                .setURL(links.discord),
            ])
      ),
      navBar(navCtx, this.locale, 'botinfo', getTabs('botinfo', bot, true as any))
    ),
  };
}
