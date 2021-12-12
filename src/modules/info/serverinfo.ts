import { colors, emojis } from '$lib/db';
import { blankServerIcon } from '$lib/functions/blankServerIcon';
import { toTitleCase } from '$lib/functions/toTitleCase';
import dayjs from 'dayjs';
import { AllowedImageSize, MessageAttachment, MessageEmbed, PresenceStatus } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'serverinfo',
  description: 'Gives information on the current server. Support for other guilds coming soon!',
  async handle() {
    const guild = await this.guild.fetch();

    const guildBlankIcon = new MessageAttachment(blankServerIcon(guild.nameAcronym), 'icon.png');

    const e = new MessageEmbed()
      .setAuthor(`${guild.name} - Server info`, guild.iconURL({ dynamic: true }))
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
                .join(' | ')} | \`/icon\``
            : '')
      )
      .addField('ID', guild.id, true)
      .addField('Owner', (await guild.fetchOwner()).user.toString(), true)
      .addField(
        'Creation date',
        `<t:${dayjs(guild.createdAt).unix()}> (<t:${dayjs(guild.createdAt).unix()}:R>)`
      )
      .setThumbnail(guild.iconURL({ dynamic: true }) ?? 'attachment://icon.png')
      .setColor(`#${colors.default}`);

    const channels = guild.channels.cache;
    const cFilter = (c: Exclude<keyof typeof ChannelTypes, 'DM' | 'GROUP_DM' | 'UNKNOWN'>) =>
      channels.filter((channel) => channel.type === c).size;
    e.addField(
      `Channels (${channels.size})`,
      `${emojis.channels.text} ${cFilter('GUILD_TEXT')} text` +
        '\n' +
        `${emojis.channels.voice} ${cFilter('GUILD_VOICE')} voice` +
        '\n' +
        `${emojis.channels.category} ${cFilter('GUILD_CATEGORY')} categories` +
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

    const members = guild.members.cache;
    const mStatus = (presence: PresenceStatus) =>
      members.filter((m) => m.presence && m.presence.status === presence).size;

    e.addField(
      `Members (${members.size})`,
      `${emojis.users.status.online} ${mStatus('online')} ` +
        `${emojis.users.status.idle} ${mStatus('idle')}` +
        '\n' +
        `${emojis.users.status.dnd} ${mStatus('dnd')} ` +
        `${emojis.users.status.invisible} ${
          guild.memberCount - (mStatus('online') + mStatus('idle') + mStatus('dnd'))
        }` +
        '\n' +
        `${emojis.users.humans} ${
          guild.memberCount - guild.members.cache.filter((m) => m.user.bot).size
        } humans` +
        '\n' +
        `${emojis.users.bots} ${guild.members.cache.filter((m) => m.user.bot).size} bots`,
      true
    );

    const roles = guild.roles.cache.filter((r) => r.id !== this.guild.id);
    if (roles.size > 0)
      e.addField(
        `${roles.size === 1 ? 'Role' : 'Roles'} (${roles.size})`,
        roles.map((r) => r.toString()).join(' ')
      );

    e.addField(
      'Boosts',
      `${guild.premiumSubscriptionCount} boosts (level ${
        guild.premiumTier === 'NONE' ? 0 : guild.premiumTier.replace('TIER_', '')
      })`,
      true
    );

    e.addField(
      'Security',
      `Verification level: ${toTitleCase(
        guild.verificationLevel.replace('_', ' ')
      )}\nContent filter: ${toTitleCase(
        guild.explicitContentFilter.replace('_', ' ')
      )}\n2FA for Moderation: ${guild.mfaLevel === 'NONE' ? 'No' : 'Yes'}`,
      true
    );

    await this.reply({ embeds: [e], files: [guildBlankIcon] });
  },
});
