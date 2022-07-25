import { getColor } from '$lib/functions/getColor';
import { invisibleChar } from '$lib/util/invisibleChar';
import {
  ButtonInteraction,
  Integration,
  Interaction,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { components, row } from 'purplet';
import { getTabs, navBar, NavBarContext } from '../components/userNavBar';
import { getBadgeEmojis } from './user info';

export async function renderBotInfo(
  ctx: Interaction,
  navCtx: NavBarContext,
  integration: Integration
) {
  const { application: app } = integration;
  const { bot } = app;
  const userBadges = getBadgeEmojis(bot.flags);

  const color =
    ctx instanceof ButtonInteraction ? ctx.message.embeds[0].color : await getColor(ctx.user);

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
    .addField('Application name', app.name)
    .addField(
      'Created at',
      `<t:${Math.round(app.createdAt.getTime() / 1000)}> (<t:${Math.round(
        app.createdAt.getTime() / 1000
      )}:R>)`
    )
    .setColor(color)
    .setThumbnail(app.iconURL());

  if (integration.role) {
    e.addField('Managed role', integration.role.toString(), true);
  }

  return {
    embeds: [e],
    components: components(
      row(
        new MessageButton()
          .setStyle('LINK')
          .setLabel('Add to Server')
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
          : null
      ),
      navBar(navCtx, ctx.locale, 'botinfo', getTabs('botinfo', bot, null, true))
    ),
  };
}
