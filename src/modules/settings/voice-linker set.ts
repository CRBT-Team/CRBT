import { colors, db, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { Prisma } from '@prisma/client';
import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'voice-linker set',
  description: 'Link access to a text channel to users in a voice channel.',
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

    const current = (await db.servers.findFirst({
      where: {
        id: this.guild.id,
      },
      select: {
        voiceLinker: true,
      },
    })) as Prisma.JsonObject;

    if (current) {
      await db.servers.update({
        where: { id: this.guild.id },
        data: { voiceLinker: { voice: text.id, text: voice.id } },
      });
    } else {
      await db.servers.create({
        data: {
          id: this.guild.id,
          voiceLinker: {
            voice: voice.id,
            text: text.id,
          },
        },
      });
    }

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Voice-Text Linker set!',
            iconURL: icons.success,
          })
          .setDescription(
            `Whenever someone joins ${voice}, they will now get access to ${text}.` +
              (current
                ? `\nThe previous linker between <#${current.text}> and <#${current.voice}> was removed\n`
                : '\n') +
              `Note: This will not affect any other channels. When ${this.client.user.username} is offline, the feature will not work and a manual permission overwrite may be needed. `
          )
          .setColor(`#${colors.success}`),
      ],
    });
  },
});
