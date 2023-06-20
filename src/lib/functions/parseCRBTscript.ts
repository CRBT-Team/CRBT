import { GuildMember, GuildTextBasedChannel, PartialGuildMember } from 'discord.js';
import { avatar } from './avatar';
import { banner } from './banner';
import { formatUsername } from './formatUsername';

export interface CRBTscriptParserArgs {
  channel: GuildTextBasedChannel;
  member: GuildMember | PartialGuildMember;
}

export function parseCRBTscript(text: string, args: CRBTscriptParserArgs): string {
  const { channel, member } = args;
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
    [
      new RegExp(/<user\.roles\.add\(([0-9]{18})\)>/g),
      (roleId) => {
        try {
          member.roles.add(roleId);
          return 'true';
        } catch (e) {
          return String(e);
        }
      },
    ],
    [
      new RegExp(/<user\.roles\.remove\(([0-9]{18})\)>/g),
      (roleId) => {
        try {
          member.roles.remove(roleId);
          return 'true';
        } catch (e) {
          return String(e);
        }
      },
    ],

    ['<server.name>', guild.name],
    ['<server.id>', guild.id],
    ['<server.icon>', () => guild.iconURL() ?? 'null'],
    ['<server.banner>', () => guild.bannerURL() ?? 'null'],
    ['<server.owner>', guild.ownerId],
    ['<server.created>', () => guild.createdAt.toISOString()],
    ['<server.roles>', () => guild.roles.cache.map((r) => r.toString()).join(', ')],
    ['<server.description>', guild.description],
    ['<server.members>', () => guild.memberCount.toString()],

    ['<channel.name>', channel.name],
    ['<channel.id>', channel.id],
    ['<channel.created>', () => channel.createdAt.toISOString()],
    ['<channel.mention>', `<#${channel.id}>`],
    ['<channel.topic>', 'topic' in channel ? channel.topic : null],
    ['<channel.isAgeRestricted>', ('nsfw' in channel ? channel.nsfw : false).toString()],

    ['<newline>', '\n'],

    ['<crbt.name>', client.user.username],
    ['<crbt.discrim>', client.user.discriminator],
    ['<crbt.tag>', client.user.tag],
    ['<crbt.id>', client.user.id],
    ['<crbt.avatar>', () => avatar(client.user)],
    ['<crbt.nickname>', guild.me.displayName],
    ['<crbt.created>', client.user.createdAt.toISOString()],
    ['<crbt.joined>', guild.me.joinedAt.toISOString()],
    ['<crbt.mention>', `<@${client.user.id}>`],
    ['<crbt.isBot>', 'true'],
    ['<crbt.roles>', guild.me.roles.cache.map((r) => r.name).join(', ')],
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
