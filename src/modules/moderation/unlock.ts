import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ChannelType } from 'discord-api-types/v10';
import { ForumChannel, TextChannel, VoiceBasedChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { ModerationAction, ModerationColors, handleModerationAction } from './_base';

export default ChatCommand({
  name: 'unlock',
  nameLocalizations: getAllLanguages('UNLOCK', localeLower),
  description: t('en-US', 'unlock.description'),
  descriptionLocalizations: getAllLanguages('unlock.description'),
  options: new OptionBuilder().channel(
    'channel',
    t('en-US', 'unlock.options.channel.description'),
    {
      nameLocalizations: getAllLanguages('CHANNEL', localeLower),
      descriptionLocalizations: getAllLanguages('unlock.options.channel.description'),
      channelTypes: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
      ],
    },
  ),
  async handle({ channel }) {
    await this.deferReply();

    const c = (channel ?? this.channel) as TextChannel | VoiceBasedChannel | ForumChannel;

    await c.permissionOverwrites.edit(c.guild.roles.everyone, {
      SEND_MESSAGES: null,
      CONNECT: null,
      SEND_MESSAGES_IN_THREADS: null,
      CREATE_PUBLIC_THREADS: null,
      CREATE_PRIVATE_THREADS: null,
      USE_APPLICATION_COMMANDS: null,
      START_EMBEDDED_ACTIVITIES: null,
    });

    await handleModerationAction.call(this, {
      guild: this.guild,
      user: this.user,
      target: c,
      type: ModerationAction.ChannelUnlock,
    });

    await this.editReply({
      embeds: [
        {
          //TODO: add a better unlock icon
          title: `🔓 ${t(this, 'LOCK_SUCCESS_TITLE', {
            channel: c,
          })}`,
          description: t(this, 'UNLOCK_SUCCESS_DESCRIPTION'),
          color: ModerationColors[ModerationAction.ChannelUnlock],
        },
      ],
    });
  },
});
