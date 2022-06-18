import { db } from '$lib/db';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { Modules } from '@prisma/client';
import { MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { parseCRBTscriptInMessage, RawServerLeave } from './shared';

export default OnEvent('guildMemberRemove', async (member) => {
  const { guild } = member;

  const {
    leaveChannel: channelId,
    leaveMessage: message,
    modules,
  } = (await db.servers.findFirst({
    where: { id: guild.id },
    select: { leaveChannel: true, leaveMessage: true, modules: true },
  })) as RawServerLeave & { modules: Modules[] };

  if (!modules.includes('LEAVE_MESSAGE')) return;
  if (!channelId || !message) return;

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
    ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
    embeds: [new MessageEmbed(parsedMessage.embed)],
  });
});
