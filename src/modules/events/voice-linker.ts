import { db } from '$lib/db';
import { TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('voiceStateUpdate', async (oldState, newState) => {
  const member = newState.guild.members.cache.get(newState.id);
  const req = await db
    .from<{ id: string; voice_linker: { voice: string; text: string } }>('servers')
    .select('id, voice_linker')
    .eq('id', newState.guild.id);

  if (req.status === 200 && req.body[0].voice_linker && req.body[0].voice_linker.voice) {
    const textChannel = (await newState.guild.channels.fetch(
      req.body[0].voice_linker.text
    )) as TextChannel;

    if (newState.channelId && !oldState.channelId) {
      await textChannel.permissionOverwrites.create(member, { VIEW_CHANNEL: true });
    } else if (oldState.channelId && !newState.channelId) {
      await textChannel.permissionOverwrites.edit(member, { VIEW_CHANNEL: false });
    }
  }
});
