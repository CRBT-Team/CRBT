import { db } from '$lib/env';
import { TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('voiceStateUpdate', async (oldState, newState) => {
  try {
    const req = (
      await db.servers.findFirst({
        where: {
          id: newState.guild.id,
          voiceLinker: {
            not: undefined,
          },
        },
        select: {
          voiceLinker: true,
        },
      })
    )?.voiceLinker as any;

    if (req) {
      const member = newState.guild.members.cache.get(newState.id);
      const textChannel = (await newState.guild.channels.fetch(req.text as string)) as TextChannel;

      if (newState.channelId && !oldState.channelId) {
        await textChannel.permissionOverwrites.create(member, { VIEW_CHANNEL: true });
      } else if (oldState.channelId && !newState.channelId) {
        await textChannel.permissionOverwrites.delete(member);
      }
    }
  } catch (e) { }
});
