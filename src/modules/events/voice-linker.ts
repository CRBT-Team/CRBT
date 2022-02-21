import { db } from '$lib/db';
import { Prisma } from '@prisma/client';
import { TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('voiceStateUpdate', async (oldState, newState) => {
  const member = newState.guild.members.cache.get(newState.id);
  const req = (
    await db.servers.findFirst({
      where: {
        id: newState.guild.id,
        voice_linker: {
          not: undefined,
        },
      },
      select: {
        voice_linker: true,
      },
    })
  ).voice_linker as Prisma.JsonObject;

  if (req) {
    const textChannel = (await newState.guild.channels.fetch(req.text as string)) as TextChannel;

    try {
      if (newState.channelId && !oldState.channelId) {
        await textChannel.permissionOverwrites.create(member, { VIEW_CHANNEL: true });
      } else if (oldState.channelId && !newState.channelId) {
        await textChannel.permissionOverwrites.edit(member, { VIEW_CHANNEL: false });
      }
    } catch (e) {}
  }
});
