import { prisma } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { OnEvent } from 'purplet';
import { parseCRBTscriptInMessage } from '../components/MessageBuilder/parseCRBTscriptInMessage';
import { RawServerLeave } from './types';

export default OnEvent('guildMemberRemove', async (member) => {
  const { guild } = member;

  try {
    const preferences = await prisma.user.findFirst({
      where: { id: member.id },
      select: { silentLeaves: true },
    });

    if (preferences && preferences.silentLeaves) return;

    const modules = await prisma.guildModules.findFirst({
      where: { id: guild.id },
      select: { leaveMessage: true },
    });

    if (!modules?.leaveMessage) return;

    const serverData = (await prisma.guild.findFirst({
      where: { id: guild.id },
      select: { leaveChannelId: true, leaveMessage: true },
    })) as unknown as RawServerLeave;

    if (!serverData) return;

    const { leaveChannelId: channelId, leaveMessage: message } = serverData;

    const channel = (await guild.channels.fetch(channelId)) as GuildTextBasedChannel;

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
  } catch (e) {
    UnknownError(member, e);
  }
});
