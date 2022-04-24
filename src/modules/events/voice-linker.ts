import { db } from '$lib/db';
import { TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('voiceStateUpdate', async (oldState, newState) => {
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
  )?.voice_linker as any;

  if (req) {
    const member = newState.guild.members.cache.get(newState.id);
    const textChannel = (await newState.guild.channels.fetch(req.text as string)) as TextChannel;

    try {
      if (newState.channelId && !oldState.channelId) {
        await textChannel.permissionOverwrites.create(member, { VIEW_CHANNEL: true });
      } else if (oldState.channelId && !newState.channelId) {
        await textChannel.permissionOverwrites.delete(member);
      }
    } catch (e) {}
  }
});
