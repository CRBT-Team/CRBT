import { db } from '$lib/db';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { Modules } from '@prisma/client';
import { MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { parseCRBTscriptInMessage, RawServerJoin } from './shared';

export default OnEvent('guildMemberUpdate', async (oldMember, member) => {
  if (oldMember.pending && !member.pending && member.id !== member.client.user.id) {
    const { guild } = member;

    const serverData = (await db.servers.findFirst({
      where: { id: guild.id },
      select: { joinChannel: true, joinMessage: true, modules: true },
    })) as RawServerJoin & { modules: Modules[] };

    if (!serverData) return;

    const { joinChannel: channelId, joinMessage: message, modules } = serverData;

    if (!modules.includes('JOIN_MESSAGE')) return;
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
  }
});

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
