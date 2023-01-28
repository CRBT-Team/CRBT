import { colors, emojis, links } from '$lib/env';
import { chunks } from '$lib/functions/chunks';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { trimArray } from '$lib/functions/trimArray';
import { getAllLanguages, t } from '$lib/language';
import {
  formatGuildBannerURL,
  formatGuildIconURL,
  timestampMention,
  userMention,
} from '@purplet/utils';
import canvas from 'canvas';
import dedent from 'dedent';
import { EmbedFieldData, Guild, Interaction, MessageAttachment } from 'discord.js';
import { resolve } from 'path';
import { ChatCommand, components, OptionBuilder } from 'purplet';
import { NavBarContext } from '../user/_navbar';
import { getTabs, serverNavBar } from './_navbar';

export default ChatCommand({
  name: 'server info',
  description: t('en-US', 'server_info.description'),
  descriptionLocalizations: getAllLanguages('server_info.description'),
  options: new OptionBuilder().string('id', t('en-US', 'server_info.options.id.description'), {
    nameLocalizations: getAllLanguages('ID', localeLower),
    descriptionLocalizations: getAllLanguages('server_info.options.id.description'),
  }),
  async handle({ id }) {
    if ((!this.guild && !id) || (id && !this.client.guilds.cache.has(id)))
      return await CRBTError(this, {
        title: t(this, 'SERVER_INFO_ERROR_INVALID_SERVER_TITLE'),
        description: t(this, 'SERVER_INFO_ERROR_INVALID_SERVER_DESCRIPTION', {
          link: links.invite,
        }),
      });

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
  const allChannels = guild.channels.cache.filter((c) => !c.isThread());
  const stickers = guild.stickers.cache;
  const allEmojis = guild.emojis.cache;
  const roles = guild.roles.cache
    .sort((a, b) => a.position - b.position)
    .filter((r) => r.id !== r.guild.id)
    .map((r) => (r.guild.id === this.guild.id ? r.toString() : `\`${r.name}\``));
  const events = guild.scheduledEvents.cache;
  const { format: formatNum } = new Intl.NumberFormat(this.locale);
  const bots = guild.members.cache.filter((m) => m.user.bot);

  const channels = {
    text: allChannels.filter((c) => c.type === 'GUILD_TEXT').size,
    voice: allChannels.filter((c) => c.type === 'GUILD_VOICE').size,
    stage: allChannels.filter((c) => c.type === 'GUILD_STAGE_VOICE').size,
    announcement: allChannels.filter((c) => c.type === 'GUILD_NEWS').size,
    category: allChannels.filter((c) => c.type === 'GUILD_CATEGORY').size,
  };

  const emoji = {
    static: allEmojis.filter((e) => !e.animated).size,
    animated: allEmojis.filter((e) => e.animated).size,
    previews: chunks(trimArray(allEmojis.map((e) => e.toString())), 5)
      .map((e) => e.join('  '))
      .join('\n'),
  };

  const fields: EmbedFieldData[] = [
    {
      name: t(this, 'ID'),
      value: guild.id,
      inline: true,
    },
    {
      name: t(this, 'OWNED_BY'),
      value: userMention(guild.ownerId),
      inline: true,
    },
    {
      name: t(this, 'CREATED_ON'),
      value: `${timestampMention(guild.createdAt)} • ${timestampMention(guild.createdAt, 'R')}`,
    },
    {
      name: `${t(this, 'CHANNELS')} • ${formatNum(allChannels.size)}`,
      value: dedent`
      ${emojis.channels.category} ${formatNum(channels.category)} ${t(this, 'CATEGORIES')}
      ${emojis.channels.text} ${formatNum(channels.text)} ${t(this, 'TEXT_CHANNELS')}
      ${emojis.channels.voice} ${formatNum(channels.voice)} ${t(this, 'VOICE_CHANNELS')}
      ${
        channels.announcement > 0
          ? `${emojis.channels.news} ${formatNum(channels.announcement)} ${t(
              this,
              'ANNOUNCEMENT_CHANNELS'
            )}`
          : ''
      } ${
        channels.stage > 0
          ? `${emojis.channels.stage} ${formatNum(channels.stage)} ${t(this, 'STAGE_CHANNELS')}`
          : ''
      }
      `,
      inline: true,
    },
  ];

  if (allEmojis.size > 0) {
    fields.push({
      name: `${t(this, 'EMOJIS')} • ${formatNum(allEmojis.size)}`,
      value: dedent`
      ${formatNum(emoji.static)} ${t(this, 'STATIC')} • ${formatNum(emoji.animated)} ${t(
        this,
        'ANIMATED'
      )}
      
      ${emoji.previews}`,
      inline: true,
    });
  }
  if (stickers.size > 0) {
    fields.push({
      name: t(this, 'STICKERS'),
      value: `${emojis.sticker} ${formatNum(stickers.size)}`,
      inline: true,
    });
  }

  fields.push({
    name: `${t(this, 'MEMBERS')} • ${formatNum(guild.memberCount)}`,
    value: `${emojis.members} ${formatNum(guild.memberCount - bots.size)} ${t(this, 'HUMANS')}\n${
      emojis.bot
    } ${formatNum(bots.size)} ${t(this, 'BOTS')}`,
    inline: true,
  });

  if (roles.length > 0) {
    fields.push({
      name: `${t(this, 'ROLES')} • ${formatNum(roles.length)}`,
      value: roles.length < 10 ? roles.join('  ') : trimArray(roles, 10).join('  '),
    });
  }

  if (guild.premiumSubscriptionCount > 0) {
    fields.push({
      name: t(this, 'SERVER_BOOSTING'),
      value: `${guild.premiumSubscriptionCount} boosts • ${
        emojis.boosting[guild.premiumTier.replace('TIER_', '')]
      } Level ${guild.premiumTier.replace('TIER_', '')}`,
      inline: true,
    });
  }

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
  canvas.registerFont(resolve('data/misc/ggsans.otf'), { family: 'ggsans' });

  const img = canvas.createCanvas(512, 512);
  const ctx = img.getContext('2d');
  if (!guild.icon) {
    ctx.fillStyle = `#${colors.blurple.toString(16)}`;
    ctx.fillRect(0, 0, img.width, img.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'normal 152px ggsans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(guild.nameAcronym, 256, 256);
  }

  return {
    embeds: [
      {
        author: {
          name: `${guild.name} - ${t(this, 'SERVER_INFO')}`,
          icon_url: guild.iconURL({ dynamic: true }),
        },
        description: guild.description,
        image: {
          url: formatGuildBannerURL(guild.id, guild.banner),
        },
        thumbnail: {
          url: guild.icon ? formatGuildIconURL(guild.id, guild.icon) : 'attachment://icon.png',
        },
        color: await getColor(guild),
        fields,
      },
    ],
    files: guild.icon ? [] : [new MessageAttachment(img.toBuffer(), 'icon.png')],
    components: components(
      serverNavBar(navCtx, this.locale, 'server_info', getTabs('server_info', guild))
    ),
  };
}

// export async function renderServerMembersRoles(
//   this: Interaction,
//   guild: Guild,
//   navCtx: NavBarContext
// ) {
//   const color =
//     this instanceof MessageComponentInteraction
//       ? this.message.embeds[0].color
//       : await getColor(guild);

//   const members = guild.memberCount;
//   const bots = hasPerms(this.appPermissions, PermissionFlagsBits.ManageGuild)
//     ? (await guild.fetchIntegrations()).filter((i) => i.type === 'discord')
//     : guild.members.cache.filter((m) => m.user.bot);
//   const roles = guild.roles.cache
//     .sort((a, b) => a.position - b.position)
//     .filter((r) => r.id !== r.guild.id)
//     .map((r) => (r.guild.id === this.guild.id ? r.toString() : `\`${r.name}\``));

//   const e = new MessageEmbed()
//     .setAuthor({
//       name: `${guild.name} - Roles & Members`,
//       iconURL: guild.iconURL({ format: 'png', dynamic: true }),
//     })
//     .setDescription(
//       `${emojis.members} ${members - bots.size} Humans • ${emojis.bot} ${bots.size} Bots`
//     )
//     .addField(`Roles • ${roles.length}`, roles.map((r) => `${r}`).join(''), true)
//     .setColor(color);

//   return {
//     embeds: [e],
//     components: components(serverNavBar(navCtx, this.locale, 'roles', getTabs('icon', guild))),
//   };
// }

// export async function renderServerEmojis(this: Interaction, guild: Guild, navCtx: NavBarContext) {
//   const color =
//     this instanceof MessageComponentInteraction
//       ? this.message.embeds[0].color
//       : await getColor(guild);
//   const emojis = guild.emojis.cache;
//   const stickers = guild.stickers.cache;

//   const e = new MessageEmbed().setAuthor({
//     name: `${guild.name} - Emojis & Stickers`,
//     iconURL: guild.iconURL({ format: 'png', dynamic: true }),
//   });

//   if (emojis.size > 0)
//     e.addField(
//       `Emojis • ${emojis.size}`,
//       `${emojis.filter((r) => !r.animated).size} static • ${
//         emojis.filter((r) => r.animated).size
//       } animated`,
//       true
//     );

//   if (stickers.size > 0)
//     e.addField(
//       `Stickers • ${stickers.size}`,
//       stickers.map((r) => `${r.name}`).join(', '),
//       true
//     ).setColor(color);

//   return {
//     embeds: [e],
//     components: components(serverNavBar(navCtx, this.locale, 'emojis')),
//   };
// }
