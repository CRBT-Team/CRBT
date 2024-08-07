import { GuildMember, GuildTextBasedChannel, PartialGuildMember } from 'discord.js';
import { avatar } from './avatar';
import { banner } from './banner';
import { formatUsername } from './formatUsername';
import { FullGuildMember } from '$lib/types/member';
import { FullGuildSettings } from '$lib/types/guild-settings';
import { colors } from '$lib/env';

export interface CRBTscriptParserArgs {
  channel: GuildTextBasedChannel;
  member: GuildMember | PartialGuildMember;
  crbtGuildMember?: FullGuildMember;
  guildSettings?: FullGuildSettings;
}

function CRBTscriptfunction(regex: RegExp, callback: (values?: string) => any) {
  return [
    regex,
    (values?: string) => {
      try {
        callback(values);
        return 'true';
      } catch (e) {
        return String(e);
      }
    },
  ] as [RegExp, (values?: string) => string];
}

export function parseCRBTscript(text: string, args: CRBTscriptParserArgs): string {
  const { channel, member, crbtGuildMember, guildSettings } = args;
  const { guild, client } = member;

  const values: [string | RegExp, string | ((values?: string) => string)][] = [
    ['<user.name>', member.user.username],
    ['<user.discrim>', member.user.discriminator],
    ['<user.tag>', formatUsername(member.user)],
    ['<user.id>', member.id],
    ['<user.avatar>', () => avatar(member.user)],
    ['<user.banner>', () => banner(member.user) ?? 'null'],
    ['<user.nickname>', member.displayName],
    ['<user.created>', member.user.createdAt.toISOString()],
    ['<user.joined>', member.joinedAt.toISOString()],
    ['<user.mention>', `<@${member.id}>`],
    ['<user.isBot>', member.user.bot.toString()],
    ['<user.roles>', member.roles.cache.map((r) => r.name).join(', ')],
    ['<user.money>', crbtGuildMember?.money.toString() ?? '0'],
    ['<user.work.exp>', crbtGuildMember?.workExp.toString() ?? '0'],
    ['<user.items.count>', crbtGuildMember?.items.length.toString() ?? '0'],

    CRBTscriptfunction(new RegExp(/<user\.roles\.add\(([0-9]{18})\)>/g), (roleId) =>
      member.roles.add(roleId),
    ),
    CRBTscriptfunction(new RegExp(/<user\.roles\.remove\(([0-9]{18})\)>/g), (roleId) =>
      member.roles.remove(roleId),
    ),

    ['<server.name>', guild.name],
    ['<server.id>', guild.id],
    ['<server.icon>', () => guild.iconURL() ?? 'null'],
    ['<server.banner>', () => guild.bannerURL() ?? 'null'],
    ['<server.owner>', guild.ownerId],
    ['<server.created>', () => guild.createdAt.toISOString()],
    ['<server.roles>', () => guild.roles.cache.map((r) => r.toString()).join(', ')],
    ['<server.description>', guild.description],
    ['<server.members>', () => guild.memberCount.toString()],

    ...[['<server.boosts>', '']],

    ...(guildSettings
      ? [
          ['<server.color>', guildSettings.accentColor ?? colors.default],
          ['<server.currency.singular>', guildSettings.economy.currencyNameSingular ?? 'N/A'],
          ['<server.currency.plural>', guildSettings.economy.currencyNamePlural ?? 'N/A'],
          ['<server.currency.symbol>', guildSettings.economy.currencySymbol ?? 'N/A'],
          ['<server.items.count>', guildSettings.economy.items.length.toString() ?? '0'],
          ['<server.categories.count>', guildSettings.economy.categories.length.toString() ?? '0'],
        ]
      : ([] as any)),

    ['<channel.name>', channel.name],
    ['<channel.id>', channel.id],
    ['<channel.created>', () => channel.createdAt.toISOString()],
    ['<channel.mention>', `<#${channel.id}>`],
    ['<channel.topic>', 'topic' in channel ? channel.topic : null],
    ['<channel.isAgeRestricted>', ('nsfw' in channel ? channel.nsfw : false).toString()],

    ['<newline>', '\n'],

    ['<crbt.name>', client.user.username],
    ['<crbt.discrim>', client.user.discriminator],
    ['<crbt.tag>', formatUsername(client.user)],
    ['<crbt.id>', client.user.id],
    ['<crbt.avatar>', () => avatar(client.user)],
    ['<crbt.nickname>', guild.members.me.displayName],
    ['<crbt.created>', client.user.createdAt.toISOString()],
    ['<crbt.joined>', guild.members.me.joinedAt.toISOString()],
    ['<crbt.mention>', `<@${client.user.id}>`],
    ['<crbt.isBot>', 'true'],
    ['<crbt.roles>', guild.members.me.roles.cache.map((r) => r.name).join(', ')],
  ];

  if (text && typeof text === 'string') {
    values.forEach(async ([key, value]) => {
      if (typeof value === 'function') {
        text = text.replaceAll(key, (_, values) => value(values));
      } else {
        text = text.replaceAll(key, value);
      }
    });
  }

  return text;
}
