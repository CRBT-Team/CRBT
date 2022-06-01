import { GuildMember, GuildTextBasedChannel } from 'discord.js';
import { avatar } from './avatar';
import { banner } from './banner';

export function parseCRBTscript(
  text: string,
  data: {
    channel: GuildTextBasedChannel;
    member: GuildMember;
  }
): string {
  const { channel, member } = data;
  const { guild, client } = member;

  const values: [string | RegExp, string | ((values?: string) => string)][] = [
    ['<user.name>', member.user.username],
    ['<user.discrim>', member.user.discriminator],
    ['<user.tag>', member.user.tag],
    ['<user.id>', member.id],
    ['<user.avatar>', () => avatar(member.user)],
    ['<user.banner>', () => banner(member.user) ?? 'None'],
    ['<user.nickname>', member.displayName],
    ['<user.created>', member.user.createdAt.toISOString()],
    ['<user.joined>', member.joinedAt.toISOString()],
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
    ['<server.icon>', () => guild.iconURL() ?? 'None'],
    ['<server.owner>', () => guild.ownerId],
    ['<server.created>', () => guild.createdAt.toISOString()],
    ['<server.roles>', () => guild.roles.cache.map((r) => r.toString()).join(', ')],

    ['<channel.name>', channel.name],
    ['<channel.id>', channel.id],

    ['<newline>', '\n'],

    ['<crbt.name>', client.user.username],
    ['<crbt.tag>', client.user.tag],
    ['<crbt.id>', client.user.id],
    ['<crbt.avatar>', () => avatar(client.user)],
  ];

  if (text) {
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
