import { colors, emojis, links } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import canvas from 'canvas';
import { capitalCase } from 'change-case';
import dayjs from 'dayjs';
import { AllowedImageSize, MessageAttachment, MessageEmbed } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'server info',
  description:
    'Gives information on a Discord server of the provided ID, or the current one if none is used.',
  options: new OptionBuilder().string(
    'id',
    'ID of the server to get info on. Defaults to the current server.'
  ),
  async handle({ id }) {
    if ((this.channel.type === 'DM' && !id) || (id && !this.client.guilds.cache.has(id)))
      return await this.reply(
        CRBTError(
          `The server ID that you used is either invalid, or I'm not part of that server! If you want to invite me over there, click **[here](${links.invite})**.`,
          `Who's that?`
        )
      );

    const guild = !id ? await this.guild.fetch() : await this.client.guilds.fetch(id);

    const e = new MessageEmbed()
      .setAuthor({ name: `${guild.name} - Server info`, iconURL: guild.iconURL({ dynamic: true }) })
      .setDescription(
        (guild.partnered ?? guild.verified ? emojis.badges.partner + ' ' : '') +
          (guild.description ? guild.description + '\n' : '') +
          (guild.icon
            ? `Icon: ${[2048, 512, 256]
                .map(
                  (size) =>
                    `**[${size}px](${guild.iconURL({
                      size: size as AllowedImageSize,
                      dynamic: true,
                    })})**`
                )
                .join(' | ')} | \`/server icon${id ? ` id:${id}` : ''}\``
            : '')
      )
      .addField('ID', guild.id, true)
      .addField('Owner', `<@!${guild.ownerId}>`, true)
      .addField(
        'Creation date',
        `<t:${dayjs(guild.createdAt).unix()}> (<t:${dayjs(guild.createdAt).unix()}:R>)`
      )
      .setThumbnail(guild.icon ? guild.iconURL({ dynamic: true }) : 'attachment://icon.png')
      .setColor(`#${colors.default}`);

    const channels = guild.channels.cache;
    function cFilter(c: Exclude<keyof typeof ChannelTypes, 'DM' | 'GROUP_DM' | 'UNKNOWN'>): number {
      return channels.filter((channel) => channel.type === c).size as number;
    }
    e.addField(
      `Channels (${channels.size})`,
      `${emojis.channels.text} ${cFilter('GUILD_TEXT')} text` +
        '\n' +
        `${emojis.channels.voice} ${cFilter('GUILD_VOICE')} voice` +
        '\n' +
        `${emojis.channels.category} ${cFilter('GUILD_CATEGORY')} ${
          cFilter('GUILD_CATEGORY') < 1 ? 'category' : 'categories'
        }` +
        '\n' +
        `${emojis.channels.news} ${cFilter('GUILD_NEWS')} announcement` +
        '\n' +
        `${emojis.channels.stage} ${cFilter('GUILD_STAGE_VOICE')} stage
        `,
      true
    );

    const stickers = guild.stickers.cache;
    const emoji = guild.emojis.cache;
    if (emoji.size > 0 && stickers.size === 0)
      e.addField(
        `${emoji.size === 1 ? 'Emoji' : 'Emojis'} (${emoji.size})`,
        `${emojis.misc.emoji.static} ${emoji.filter((r) => !r.animated).size} static` +
          '\n' +
          `${emojis.misc.emoji.animated} ${emoji.filter((r) => r.animated).size} animated`,
        true
      );
    else if (stickers.size > 0)
      e.addField(
        `Emojis & Stickers`,
        `${emojis.misc.emoji.static} **${emoji.size === 1 ? 'Emoji' : 'Emojis'} (${emoji.size})**` +
          '\n' +
          `${emoji.filter((r) => !r.animated).size} static` +
          '\n' +
          `${emoji.filter((r) => r.animated).size} animated` +
          '\n' +
          `${emojis.misc.sticker} **Stickers (${stickers.size})**`,
        true
      );

    // const members = guild.members.cache;
    // const mStatus = (presence: PresenceStatus) =>
    //   members.filter((m) => m.presence && m.presence.status === presence).size;

    e.addField(
      `Members`,
      `${emojis.users.humans} ${guild.members.cache.size ?? guild.approximateMemberCount}`,
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
      true
    );

    const roles = guild.roles.cache
      .sort((a, b) => a.position - b.position)
      .filter((r) => r.id !== r.guild.id)
      .map((r) => (r.guild.id === this.guild.id ? r.toString() : r.name));
    if (roles.length > 0)
      e.addField(
        `${roles.length === 1 ? 'Role' : 'Roles'} (${roles.length})`,
        roles.length < 10 ? roles.join(', ') : trimArray(roles).join(', ')
      );

    const boostingPlans = {
      NONE: 'Free',
      TIER_1: 'Friends',
      TIER_2: 'Groups',
      TIER_3: 'Communities',
    };
    e.addField(
      'Boosting',
      `Has ${guild.premiumSubscriptionCount} boosts\nCurrent plan: ${
        boostingPlans[guild.premiumTier]
      }`,
      true
    );

    e.addField(
      'Security',
      `Verification level: ${capitalCase(
        guild.verificationLevel.replace('_', ' ')
      )}\nContent filter: ${capitalCase(
        guild.explicitContentFilter.replace('_', ' ')
      )}\n2FA for Moderation: ${guild.mfaLevel === 'NONE' ? 'No' : 'Yes'}`,
      true
    );

    canvas.registerFont('data/misc/whitney.otf', { family: 'Whitney' });
    const img = canvas.createCanvas(512, 512);
    const ctx = img.getContext('2d');
    ctx.fillStyle = `#${colors.blurple}`;
    ctx.fillRect(0, 0, img.width, img.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'normal 152px Whitney';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(guild.nameAcronym, 256, 256);

    await this.reply({
      embeds: [e],
      files: guild.icon ? [] : [new MessageAttachment(img.toBuffer(), 'icon.png')],
    });
  },
});

const trimArray = (arr: string[], max: number = 10) => {
  if (arr.length > max) {
    const len = arr.length - max;
    arr = arr.slice(0, max);
    arr.push(`and ${len} more...`);
  }
  return arr;
};
