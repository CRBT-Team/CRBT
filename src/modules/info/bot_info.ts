import { cache } from '$lib/cache';
import { links, misc } from '$lib/db';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import {
  ButtonInteraction,
  Integration,
  Interaction,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import pjson from '../../../package.json';
import { getTabs, navBar, NavBarContext } from '../components/userNavBar';
import { allCommands } from '../events/ready';
import { getBadgeEmojis } from './user_info';

export default ChatCommand({
  name: 'bot info',
  description: 'Get info on a given Discord bot, or stats about CRBT if no bot is given.',
  options: new OptionBuilder().user('bot', 'What bot to get info on. Defaults to CRBT.'),
  async handle({ bot }) {
    bot = bot || this.client.user;
    this.client.application;

    const bots =
      cache.get<Integration[]>(`${this.guild.id}:integrations`) ??
      (await this.guild.fetchIntegrations()).filter(({ type }) => type === 'discord').toJSON();

    const botInfo = bots.find(({ application }) => application.bot.id === bot.id);

    cache.set<Integration[]>(`${this.guild.id}:integrations`, bots);

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
  integration: Integration
) {
  console.log(integration);

  const { application: app } = integration;
  const { bot } = app;
  const userBadges = getBadgeEmojis(bot.flags);

  const isSelf = bot.id === this.client.user.id;

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
    .addField('Added by', integration.user.toString(), true)
    .addField(
      strings.CREATED,
      `<t:${Math.round(app.createdAt.getTime() / 1000)}> • <t:${Math.round(
        app.createdAt.getTime() / 1000
      )}:R>`
    )
    .setColor(color)
    .setThumbnail(app.iconURL());
  if (isSelf) {
    e.addField(strings.UPTIME, `<t:${uptime}> • <t:${uptime}:R>`);
  }

  if (integration.role) {
    e.addField('Managed role', integration.role.toString());
  }

  if (isSelf) {
    const pingCmd = allCommands.find(({ name }) => name === 'ping');

    e.addField(strings.MEMBER_COUNT, this.client.users.cache.size.toLocaleString(this.locale), true)
      .addField(
        strings.SERVER_COUNT,
        this.client.guilds.cache.size.toLocaleString(this.locale),
        true
      )
      .addField(
        strings.PING,
        `${strings.PING_RESULT.replace('<PING>', `${Date.now() - this.createdTimestamp}`)} • </${
          pingCmd.name
        }:${pingCmd.id}>`,
        true
      )
      .setFooter({
        text: `${this.client.user.id === misc.CRBTid ? 'Stable' : 'Dev'} ${
          pjson.version
        } • Purplet ${pjson.dependencies['purplet'].slice(1)}`,
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
              app.termsOfServiceURL
                ? new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Terms of Service')
                    .setURL(app.termsOfServiceURL)
                : null,
              app.privacyPolicyURL
                ? new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Privacy Policy')
                    .setURL(app.privacyPolicyURL)
                : null,
            ]
          : [
              new MessageButton()
                .setStyle('LINK')
                .setLabel(strings.BUTTON_INVITE)
                .setURL(links.invite),
              new MessageButton()
                .setStyle('LINK')
                .setEmoji('❤️')
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
