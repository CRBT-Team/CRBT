import { colors, db, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getStrings } from '$lib/language';
import { Prisma } from '@prisma/client';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'voice-linker set',
  description: 'Link access to a text channel to users in a voice channel.',
  options: new OptionBuilder()
    .channel('voice', 'The voice channel to link to.', {
      channelTypes: [ChannelType.GuildVoice],
      required: true,
    })
    .channel('text', 'The text channel to link to.', {
      channelTypes: [ChannelType.GuildText],
      required: true,
    }),
  async handle({ voice, text }) {
    const { GUILD_ONLY } = getStrings(this.locale, 'globalErrors');

    if (this.channel.type === 'DM') {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
      return this.reply(CRBTError('You must be an administrator to use this command.'));
    }
    if (
      !(text as TextChannel)
        .permissionsFor(this.guild.me)
        .has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ViewChannel])
    ) {
      return this.reply(CRBTError('I do not have permission to manage the text channel.'));
    }

    try {
      (text as TextChannel).permissionOverwrites.create(this.guild.id, { VIEW_CHANNEL: false });
    } catch (e) {
      return this.reply(CRBTError('I do not have permission to manage the text channel.'));
    }
    await this.deferReply({ ephemeral: true });

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
            `Whenever someone joins ${voice}, they will now get access to ${text}.\n` +
              (current
                ? `The previous linker between <#${current.text}> and <#${current.voice}> was removed.\n`
                : '') +
              `Note: This will not affect any other channels. When ${this.client.user.username} is offline, the feature will not work and a manual permission overwrite may be needed. `
          )
          .setColor(`#${colors.success}`),
      ],
    });
  },
});
