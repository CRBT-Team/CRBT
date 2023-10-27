import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { slashCmd } from '$lib/functions/commandMention';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import dedent from 'dedent';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  ForumChannel,
  GuildTextBasedChannel,
  TextChannel,
  VoiceBasedChannel,
} from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { ModerationAction, ModerationColors, handleModerationAction } from './_base';

export default ChatCommand({
  name: 'lock',
  nameLocalizations: getAllLanguages('LOCK', localeLower),
  description: t('en-US', 'lock.description'),
  descriptionLocalizations: getAllLanguages('lock.description'),
  options: new OptionBuilder()
    .channel('channel', t('en-US', 'lock.options.channel.description'), {
      nameLocalizations: getAllLanguages('CHANNEL', localeLower),
      descriptionLocalizations: getAllLanguages('lock.options.channel.description'),
      channelTypes: [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
      ],
    })
    .string('reason', t('en-US', 'REASON_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('REASON', localeLower),
      descriptionLocalizations: getAllLanguages('REASON_DESCRIPTION'),
      maxLength: 256,
    }),
  async handle({ channel, reason }) {
    const c = (channel ?? this.channel) as TextChannel | VoiceBasedChannel | ForumChannel;

    if (
      [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
        PermissionFlagsBits.UseApplicationCommands,
        PermissionFlagsBits.UseEmbeddedActivities,
      ].some((p) => !c.permissionsFor(c.guild.roles.everyone)?.has(p))
    ) {
      return CRBTError(this, {
        title: t(this, 'LOCK_ERROR_ALREADY_LOCKED_TITLE'),
        description: t(this, 'LOCK_ERROR_ALREADY_LOCKED_DESCRIPTION'),
      });
    }

    return handleModerationAction.call(this, {
      guild: this.guild,
      user: this.user,
      target: c,
      type: ModerationAction.ChannelLock,
      reason,
    });
  },
});

export async function lockChannel(this: CommandInteraction, channel: GuildTextBasedChannel) {
  const c = channel as TextChannel | VoiceBasedChannel | ForumChannel;

  await c.permissionOverwrites.edit(c.guild.roles.everyone, {
    SEND_MESSAGES: false,
    CONNECT: false,
    SEND_MESSAGES_IN_THREADS: false,
    CREATE_PUBLIC_THREADS: false,
    CREATE_PRIVATE_THREADS: false,
    USE_APPLICATION_COMMANDS: false,
    START_EMBEDDED_ACTIVITIES: false,
  });

  await this.editReply({
    embeds: [
      {
        title: `${emojis.lock} ${t(this, 'LOCK_SUCCESS_TITLE', {
          channel: c,
        })}`,
        description: dedent`
${t(
  this,
  c.isVoice()
    ? 'LOCK_SUCCESS_DESCRIPTION_VOICE'
    : c.type === 'GUILD_FORUM'
    ? 'LOCK_SUCCESS_DESCRIPTION_FORUM'
    : 'LOCK_SUCCESS_DESCRIPTION_TEXT',
)}
${t(this, 'LOCK_SUCCESS_DESCRIPTION_COMMAND', {
  command: slashCmd('unlock'),
})}

⚠️ ${t(this, 'LOCK_SUCCESS_DESCRIPTION_WARNING')}
`,
        color: ModerationColors[ModerationAction.ChannelLock],
      },
    ],
  });
}
