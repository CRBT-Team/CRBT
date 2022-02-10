import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'voice-linker set',
  description: 'Limits access to a text channel to a voice channel.',
  options: new OptionBuilder()
    .channel('voice', 'The voice channel to link to.', true)
    .channel('text', 'The text channel to link to.', true),
  async handle({ voice, text }) {
    const m = this.guild.members.cache.get(this.user.id);
    // check if user is admin
    if (!m.permissions.has('ADMINISTRATOR')) {
      return this.reply(CRBTError(null, 'You must be an administrator to use this command.'));
    }

    await this.deferReply();

    const req = await db
      .from('servers')
      .update({ voice_linker: { voice: voice.id, text: text.id } });

    if (req.status === 200) {
      await this.editReply('Good');
    } else {
      await this.editReply('Bad');
    }
  },
});
