import { prisma } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { OnEvent } from 'purplet';
import { parseCRBTscriptInMessage } from '../components/MessageBuilder/parseCRBTscriptInMessage';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { getServerMember } from '../economy/_helpers';

export default OnEvent('guildMemberRemove', async (member) => {
  const { guild } = member;

  try {
    const preferences = await prisma.user.findFirst({
      where: { id: member.id },
      select: { silentLeaves: true },
    });

    if (preferences && preferences.silentLeaves) return;

    const guildSettings = await getGuildSettings(guild.id);

    if (!guildSettings.modules.leaveMessage) return;

    const { leaveChannelId: channelId, leaveMessage: message } = guildSettings;

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
  } catch (e) {
    UnknownError(member, e);
  }
});
