import { prisma } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { GuildMember, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { parseCRBTscriptInMessage } from '../components/MessageBuilder/parseCRBTscriptInMessage';
import { RawServerJoin } from './types';

export default OnEvent('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.pending && !newMember.pending) {
    try {
      welcome(newMember);
    } catch (e) {
      UnknownError(newMember, e);
    }
  }
});

export const join = OnEvent('guildMemberAdd', (member) => {
  // const channel = member.client.channels.fetch('1003652205896806430').then((c) => {
  //   (c as TextChannel).send(member.id);
  // });

  if (member.pending) return;
  if (member.client.user.id === member.id) return;

  try {
    welcome(member);
  } catch (e) {
    UnknownError(member, e);
  }
});

async function welcome(member?: GuildMember) {
  const { guild } = member;
  const preferences = await prisma.user.findFirst({
    where: { id: member.id },
    select: { silentJoins: true },
  });

  if (preferences && preferences.silentJoins) return;

  const modules = await prisma.serverModules.findFirst({
    where: { id: guild.id },
    select: { joinMessage: true },
  });

  if (!modules?.joinMessage) return;

  const serverData = (await prisma.servers.findFirst({
    where: { id: guild.id },
    select: { joinChannel: true, joinMessage: true },
  })) as RawServerJoin;

  if (!serverData) return;

  const { joinChannel: channelId, joinMessage: message } = serverData;

  if (!channelId || !message) return;

  const channel = guild.channels.cache.get(channelId) as TextChannel | NewsChannel;

  const parsedMessage = parseCRBTscriptInMessage(message, {
    channel,
    member,
  });

  channel.send({
    allowedMentions: {
      users: [member.user.id],
    },
    ...(message.content ? { content: parsedMessage.content } : {}),
    embeds: message.embed ? [new MessageEmbed(parsedMessage.embed)] : [],
  });
}

// export function getDefaultChannel(guild: Guild) {
//   const system = guild.systemChannel;
//   if (system.permissionsFor(guild.me).has('SEND_MESSAGES')) return system;

//   const general = guild.channels.cache.find(
//     (c) =>
//       c.name === 'general' &&
//       c.type === 'GUILD_TEXT' &&
//       c.permissionsFor(guild.me).has('SEND_MESSAGES')
//   ) as TextChannel;

//   if (general) return general;

//   return guild.channels.cache
//     .filter((c) => c.type === 'GUILD_TEXT' && c.permissionsFor(guild.me).has('SEND_MESSAGES'))
//     .first() as TextChannel;
// }
