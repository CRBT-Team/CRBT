import { colors, emojis } from '$lib/db';
import { chunks } from '$lib/functions/chunks';
import { CRBTError } from '$lib/functions/CRBTError';
import { trimArray } from '$lib/functions/trimArray';
import canvas from 'canvas';
import { capitalCase } from 'change-case';
import dayjs from 'dayjs';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { ChatCommand, OptionBuilder } from 'purplet';

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
      return await this.reply(
        CRBTError(
          `The server ID that you used is either invalid, or I was not added to this server. To do so, click CRBT then "Add to Server".`
        )
      );

    const guild = !id ? await this.guild.fetch() : await this.client.guilds.fetch(id);

    const channels = guild.channels.cache;
    const stickers = guild.stickers.cache;
    const emoji = guild.emojis.cache;
    const roles = guild.roles.cache
      .sort((a, b) => a.position - b.position)
      .filter((r) => r.id !== r.guild.id)
      .map((r) => (r.guild.id === this.guild.id ? r.toString() : `\`${r.name}\``));
    const events = guild.scheduledEvents.cache;
    const bots = guild.me.permissions.has('MANAGE_GUILD')
      ? (await guild.fetchIntegrations()).filter((i) => i.type === 'discord').map((i) => i.name)
      : null;

    function cFilter(c: Exclude<keyof typeof ChannelTypes, 'DM' | 'GROUP_DM' | 'UNKNOWN'>): number {
      return channels.filter((channel) => channel.type === c).size;
    }

    const e = new MessageEmbed()
      .setAuthor({ name: `${guild.name} - Server info`, iconURL: guild.iconURL({ dynamic: true }) })
      .setDescription(
        (guild.partnered ?? guild.verified ? emojis.badges.partner + ' ' : '') +
          (guild.description ? guild.description + '\n' : '')
      )
      .setImage(guild.bannerURL())
      .setThumbnail(guild.icon ? guild.iconURL({ dynamic: true }) : 'attachment://icon.png')
      .setColor(`#${colors.default}`)
      .addField('ID', guild.id, true)
      .addField(`Owned by`, `<@${guild.ownerId}>`, true)
      .addField(
        'Created at',
        `<t:${dayjs(guild.createdAt).unix()}> (<t:${dayjs(guild.createdAt).unix()}:R>)`
      )
      .addField(
        `Channels (${channels.size})`,
        `${emojis.channels.category} ${cFilter('GUILD_CATEGORY')} ${
          cFilter('GUILD_CATEGORY') < 1 ? 'category' : 'categories'
        }\n` +
          `${emojis.channels.text} ${cFilter('GUILD_TEXT')} text channels\n` +
          `${emojis.channels.voice} ${cFilter('GUILD_VOICE')} voice channels\n` +
          (cFilter('GUILD_NEWS') !== 0
            ? `${emojis.channels.news} ${cFilter('GUILD_NEWS')} annnouncements\n`
            : '') +
          (cFilter('GUILD_STAGE_VOICE') !== 0
            ? `${emojis.channels.stage} ${cFilter('GUILD_STAGE_VOICE')} stage`
            : ''),
        true
      );

    if (emoji.size > 0) {
      const allEmojis = chunks(
        trimArray(
          emoji /*.random(emoji.size)*/
            .map((e) => e.toString())
        ),
        5
      )
        .map((e) => e.join('  '))
        .join('\n');

      e.addField(
        `${emoji.size === 1 ? 'Emoji' : 'Emojis'} (${emoji.size})`,
        `${emoji.filter((r) => !r.animated).size} static • ${
          emoji.filter((r) => r.animated).size
        } animated\n\n${allEmojis}`,
        true
      );
    }
    if (stickers.size > 0) e.addField(`Stickers`, `${emojis.sticker} ${stickers.size}`, true);

    const members = guild.members.cache.size || guild.memberCount || guild.approximateMemberCount;
    //   members.filter((m) => m.presence && m.presence.status === presence).size;
    // const mStatus = (presence: PresenceStatus) =>

    if (!bots) {
      e.addField(`Members`, `${emojis.members} ${members} (including Bots and Apps)`, true);
    } else {
      e.addField(
        `Members (${members})`,
        `${emojis.members} ${members - bots.length} Humans\n${emojis.bot} ${bots.length} Bots`,
        true
      );
    }
    // `${emojis.users.status.online} ${mStatus('online')} ` +
    //   `${emojis.users.status.idle} ${mStatus('idle')}` +
    //   '\n' +
    //   `${emojis.users.status.dnd} ${mStatus('dnd')} ` +
    //   `${emojis.users.status.invisible} ${
    //     guild.memberCount - (mStatus('online') + mStatus('idle') + mStatus('dnd'))
    //   }` +
    //   '\n' +
    //   `${emojis.users.humans} ${
    //     guild.memberCount - guild.members.cache.filter((m) => m.user.bot).size
    //   } humans` +
    //   '\n' +
    //   `${emojis.users.bots} ${guild.members.cache.filter((m) => m.user.bot).size} bots`,

    if (roles.length > 0)
      e.addField(
        `${roles.length === 1 ? 'Role' : 'Roles'} (${roles.length})`,
        roles.length < 5 ? roles.join('  ') : trimArray(roles).join('  ')
      );

    e.addField(
      `Server Boosting`,
      `${guild.premiumSubscriptionCount === 0 ? 'No' : guild.premiumSubscriptionCount} boosts` +
        (guild.premiumTier !== 'NONE'
          ? ` • ${
              emojis.boosting[guild.premiumTier.replace('TIER_', '')]
            } Level ${guild.premiumTier.replace('TIER_', '')}`
          : ''),
      true
    );

    e.addField(
      'Moderation',
      `Verification level:\n${capitalCase(
        guild.verificationLevel.replace('_', ' ')
      )}\nExplicit media filter:\n${capitalCase(
        guild.explicitContentFilter.replace('_', ' ')
      )}\n2FA for Moderation: ${guild.mfaLevel === 'NONE' ? 'Disabled' : 'Required'}`,
      true
    );

    if (events.size > 0) {
      const active = events.filter((e) => e.isActive()).size;
      e.addField(
        `Events (${events.size})`,
        `${emojis.event} ${active} Active\n${emojis.event} ${events.size - active} Planned`,
        true
      );
    }

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

    await this.reply({
      embeds: [e],
      files: guild.icon ? [] : [new MessageAttachment(img.toBuffer(), 'icon.png')],
    });
  },
});
