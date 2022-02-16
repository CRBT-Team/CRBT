import { colors, db, emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'voice-linker set',
  description: 'Limits access to a text channel to a voice channel.',
  options: new OptionBuilder()
    .channel('voice', 'The voice channel to link to.', true)
    .channel('text', 'The text channel to link to.', true),
  async handle({ voice, text }) {
    const m = this.guild.members.cache.get(this.user.id);
    if (!m.permissions.has(Permissions.FLAGS.ADMINISTRATOR, true)) {
      return this.reply(CRBTError('You must be an administrator to use this command.'));
    }
    if (text.type !== 'GUILD_TEXT') {
      return this.reply(CRBTError('The text channel must be a text channel.'));
    }
    if (!voice.isVoice()) {
      return this.reply(CRBTError('The voice channel must be a voice channel.'));
    }
    // check if bot can manage perms of text channel
    if (
      !(text as TextChannel)
        .permissionsFor(this.guild.me)
        .has([Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.VIEW_CHANNEL])
    ) {
      return this.reply(CRBTError('I do not have permission to manage the text channel.'));
    }

    try {
      (text as TextChannel).permissionOverwrites.create(this.guild.id, { VIEW_CHANNEL: false });
    } catch (e) {
      return this.reply(CRBTError('I do not have permission to manage the text channel.'));
    }
    await this.deferReply();

    const current = await db.from('servers').select('id,voice_linker').eq('id', this.guild.id);

    const req = await db
      .from('servers')
      .update({ voice_linker: { voice: voice.id, text: text.id } })
      .eq('id', this.guild.id);

    if (req.status === 200) {
      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.success} Voice linker set!`)
            .setDescription(
              `Whenever someone joins ${voice}, they will now get access to ${text}.` +
                (current.body[0] && current.body[0].voice_linker
                  ? `\nThe previous linker between <#${current.body[0].voice_linker.text}> and <#${current.body[0].voice_linker.voice}> was removed\n`
                  : '\n') +
                `Note: This will not affect any other channels. When ${this.client.user.username} is offline, the feature will not work and a manual permission overwrite may be needed. `
            )
            .setColor(`#${colors.success}`),
        ],
      });
    } else {
      await this.editReply('Bad');
    }
  },
});
