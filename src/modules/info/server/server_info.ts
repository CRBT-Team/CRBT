import { colors, emojis } from '$lib/db';
import { chunks } from '$lib/functions/chunks';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { trimArray } from '$lib/functions/trimArray';
import canvas from 'canvas';
import dayjs from 'dayjs';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  Guild,
  Interaction,
  MessageAttachment,
  MessageComponentInteraction,
  MessageEmbed,
} from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { ChatCommand, components, OptionBuilder } from 'purplet';
import { NavBarContext } from '../user/_navbar';
import { getTabs, serverNavBar } from './_navbar';

export default ChatCommand({
  name: 'server info',
  description:
    'Get information on a given Discord server, or the current one if no server is specified.',
  options: new OptionBuilder().string(
    'id',
    'ID of the server to get info on. Defaults to the current server.'
  ),
  async handle({ id }) {
    if ((!this.guild && !id) || (id && !this.client.guilds.cache.has(id)))
      return await CRBTError(this, `The server ID that you used is either invalid, or I was not added to this server. To do so, click CRBT then "Add to Server".`);

    const guild = !id ? await this.guild.fetch() : await this.client.guilds.fetch(id);

    await this.reply(
      await renderServerInfo.call(this, guild, {
        userId: this.user.id,
        targetId: this.guildId,
      })
    );
  },
});

export async function renderServerInfo(this: Interaction, guild: Guild, navCtx: NavBarContext) {
  const channels = guild.channels.cache;
  const stickers = guild.stickers.cache;
  const emoji = guild.emojis.cache;
  const roles = guild.roles.cache
    .sort((a, b) => a.position - b.position)
    .filter((r) => r.id !== r.guild.id)
    .map((r) => (r.guild.id === this.guild.id ? r.toString() : `\`${r.name}\``));
  const events = guild.scheduledEvents.cache;
  const bots = hasPerms(this.appPermissions, PermissionFlagsBits.ManageGuild)
    ? (await guild.fetchIntegrations()).filter((i) => i.type === 'discord')
    : guild.members.cache.filter((m) => m.user.bot);

  function cFilter(c: Exclude<keyof typeof ChannelTypes, 'DM' | 'GROUP_DM' | 'UNKNOWN'>): number {
    return channels.filter((channel) => channel.type === c).size;
  }

  const e = new MessageEmbed()

    .setAuthor({ name: `${guild.name} - Server info`, iconURL: guild.iconURL({ dynamic: true }) })
    .setDescription(
      `${guild.partnered ?? guild.verified ? `${emojis.badges.partner}\n` : ''}${guild.description ?? ''
      }`
    )
    .setImage(guild.bannerURL())
    .setThumbnail(guild.icon ? guild.iconURL({ dynamic: true }) : 'attachment://icon.png')
    .setColor(`#${colors.default}`)
    .addField('ID', guild.id, true)
    .addField(`Owned by`, `<@${guild.ownerId}>`, true)
    .addField(
      'Created at',
      `<t:${dayjs(guild.createdAt).unix()}> • <t:${dayjs(guild.createdAt).unix()}:R>`
    )
    .addField(
      `Channels • ${channels.size}`,
      `${emojis.channels.category} ${cFilter('GUILD_CATEGORY')} ${cFilter('GUILD_CATEGORY') < 1 ? 'category' : 'categories'
      }\n` +
      `${emojis.channels.text} ${cFilter('GUILD_TEXT')} text channel(s)\n` +
      `${emojis.channels.voice} ${cFilter('GUILD_VOICE')} voice channel(s)\n` +
      (cFilter('GUILD_NEWS') !== 0
        ? `${emojis.channels.news} ${cFilter('GUILD_NEWS')} annnouncement channel(s)\n`
        : '') +
      (cFilter('GUILD_STAGE_VOICE') !== 0
        ? `${emojis.channels.stage} ${cFilter('GUILD_STAGE_VOICE')} stage channel(s)`
        : ''),
      true
    );

  if (emoji.size > 0) {
    const allEmojis = chunks(trimArray(emoji.map((e) => e.toString())), 5)
      .map((e) => e.join('  '))
      .join('\n');

    e.addField(
      `${emoji.size === 1 ? 'Emoji' : 'Emojis'} • ${emoji.size}`,
      `${emoji.filter((r) => !r.animated).size} static • ${emoji.filter((r) => r.animated).size
      } animated\n\n${allEmojis}`,
      true
    );
  }
  if (stickers.size > 0) e.addField(`Stickers`, `${emojis.sticker} ${stickers.size}`, true);

  e.addField(
    `Members • ${guild.memberCount}`,
    `${emojis.members} ${guild.memberCount - bots.size} Humans\n${emojis.bot} ${bots.size} Bots`,
    true
  );

  if (roles.length > 0)
    e.addField(
      `${roles.length === 1 ? 'Role' : 'Roles'} • ${roles.length}`,
      roles.length < 10 ? roles.join('  ') : trimArray(roles, 10).join('  ')
    );

  e.addField(
    `Server Boosting`,
    `${guild.premiumSubscriptionCount === 0 ? 'No' : guild.premiumSubscriptionCount} boosts` +
    (guild.premiumTier !== 'NONE'
      ? ` • ${emojis.boosting[guild.premiumTier.replace('TIER_', '')]
      } Level ${guild.premiumTier.replace('TIER_', '')}`
      : ''),
    true
  );

  // e.addField(
  //   'Moderation',
  //   `Verification level:\n${capitalCase(
  //     guild.verificationLevel.replace('_', ' ')
  //   )}\nExplicit media filter:\n${capitalCase(
  //     guild.explicitContentFilter.replace('_', ' ')
  //   )}\n2FA for Moderation: ${guild.mfaLevel === 'NONE' ? 'Disabled' : 'Required'}`,
  //   true
  // );

  // if (events.size > 0) {
  //   const active = events.filter((e) => e.isActive()).size;
  //   e.addField(
  //     `Events • ${events.size}`,
  //     `${emojis.event} ${active} Active\n${emojis.event} ${events.size - active} Planned`,
  //     true
  //   );
  // }

  const img = canvas.createCanvas(512, 512);
  const ctx = img.getContext('2d');
  if (!guild.icon) {
    canvas.registerFont('data/misc/whitney.otf', { family: 'Whitney' });
    ctx.fillStyle = `#${colors.blurple}`;
    ctx.fillRect(0, 0, img.width, img.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'normal 152px Whitney';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(guild.nameAcronym, 256, 256);
  }

  return {
    embeds: [e],
    files: guild.icon ? [] : [new MessageAttachment(img.toBuffer(), 'icon.png')],
    components: components(
      serverNavBar(navCtx, this.locale, 'server_info', getTabs('server_info', guild))
    ),
  };
}

export async function renderServerMembersRoles(
  this: Interaction,
  guild: Guild,
  navCtx: NavBarContext
) {
  const color =
    this instanceof MessageComponentInteraction
      ? this.message.embeds[0].color
      : await getColor(guild);

  const members = guild.memberCount;
  const bots = hasPerms(this.appPermissions, PermissionFlagsBits.ManageGuild)
    ? (await guild.fetchIntegrations()).filter((i) => i.type === 'discord')
    : guild.members.cache.filter((m) => m.user.bot);
  const roles = guild.roles.cache
    .sort((a, b) => a.position - b.position)
    .filter((r) => r.id !== r.guild.id)
    .map((r) => (r.guild.id === this.guild.id ? r.toString() : `\`${r.name}\``));

  const e = new MessageEmbed()
    .setAuthor({
      name: `${guild.name} - Roles & Members`,
      iconURL: guild.iconURL({ format: 'png', dynamic: true }),
    })
    .setDescription(
      `${emojis.members} ${members - bots.size} Humans • ${emojis.bot} ${bots.size} Bots`
    )
    .addField(`Roles • ${roles.length}`, roles.map((r) => `${r}`).join(''), true)
    .setColor(color);

  return {
    embeds: [e],
    components: components(serverNavBar(navCtx, this.locale, 'roles', getTabs('icon', guild))),
  };
}

export async function renderServerEmojis(this: Interaction, guild: Guild, navCtx: NavBarContext) {
  const color =
    this instanceof MessageComponentInteraction
      ? this.message.embeds[0].color
      : await getColor(guild);
  const emojis = guild.emojis.cache;
  const stickers = guild.stickers.cache;

  const e = new MessageEmbed().setAuthor({
    name: `${guild.name} - Emojis & Stickers`,
    iconURL: guild.iconURL({ format: 'png', dynamic: true }),
  });

  if (emojis.size > 0)
    e.addField(
      `Emojis • ${emojis.size}`,
      `${emojis.filter((r) => !r.animated).size} static • ${emojis.filter((r) => r.animated).size
      } animated`,
      true
    );

  if (stickers.size > 0)
    e.addField(
      `Stickers • ${stickers.size}`,
      stickers.map((r) => `${r.name}`).join(', '),
      true
    ).setColor(color);

  return {
    embeds: [e],
    components: components(serverNavBar(navCtx, this.locale, 'emojis')),
  };
}
