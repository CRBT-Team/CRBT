import { prisma } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { GuildMember, GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { OnEvent } from 'purplet';
import { parseCRBTscriptInMessage } from '../components/MessageBuilder/parseCRBTscriptInMessage';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { getServerMember } from '../economy/_helpers';

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

  const guildSettings = await getGuildSettings(guild.id);

  if (!guildSettings.modules.joinMessage) return;

  const { joinChannelId: channelId, joinMessage: message } = guildSettings;

  if (!channelId || !message) return;

  const channel = (await guild.channels.fetch(channelId)) as GuildTextBasedChannel;
  const crbtGuildMember = await getServerMember(member.id, guild.id);

  const parsedMessage = parseCRBTscriptInMessage(message, {
    channel,
    member,
    crbtGuildMember,
    guildSettings,
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
