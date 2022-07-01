import { db } from '$lib/db';
import { GuildMember, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { RawServerJoin } from './types';
import { parseCRBTscriptInMessage } from './utility/parseCRBTscriptInMessage';

export default OnEvent('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.pending && !newMember.pending) {
    welcome(newMember);
  }
});

export const join = OnEvent('guildMemberAdd', (member) => {
  if (member.pending) return;
  if (member.client.user.id === member.id) return;

  welcome(member);
});

async function welcome(member?: GuildMember) {
  const { guild } = member;

  const preferences = await db.users.findFirst({
    where: { id: member.id },
    select: { silentJoins: true },
  });

  if (preferences && preferences.silentJoins) return;

  const modules = await db.serverModules.findFirst({
    where: { id: guild.id },
    select: { joinMessage: true },
  });

  if (!modules?.joinMessage) return;

  const serverData = (await db.servers.findFirst({
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
