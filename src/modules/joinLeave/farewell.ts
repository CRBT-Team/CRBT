import { db } from '$lib/db';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { parseCRBTscriptInMessage, RawServerLeave } from './shared';

export default OnEvent('guildMemberRemove', async (member) => {
  const { guild } = member;

  const modules = await db.serverModules.findFirst({
    where: { id: guild.id },
    select: { leaveMessage: true },
  });

  if (!modules?.leaveMessage) return;

  const serverData = (await db.servers.findFirst({
    where: { id: guild.id },
    select: { leaveChannel: true, leaveMessage: true },
  })) as RawServerLeave;

  if (!serverData) return;

  const { leaveChannel: channelId, leaveMessage: message } = serverData;

  const channel = guild.channels.cache.get(channelId) as TextChannel | NewsChannel;

  if (message.script) {
    parseCRBTscript(message.script, {
      member,
      channel,
    });
  }

  const parsedMessage = parseCRBTscriptInMessage(message, {
    channel,
    member,
  });

  channel.send({
    allowedMentions: {
      users: [member.user.id],
    },
    ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
    embeds: [new MessageEmbed(parsedMessage.embed)],
  });
});
