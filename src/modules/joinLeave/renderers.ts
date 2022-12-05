import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { JoinLeaveData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  GuildMember,
  Interaction,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { components, row } from 'purplet';
import { MessageBuilder } from '../components/MessageBuilder';
import { parseCRBTscriptInMessage } from '../components/MessageBuilder/parseCRBTscriptInMessage';
import { RawServerJoin, RawServerLeave, resolveMsgType } from './types';

export function defaultMessage(this: Interaction, type: JoinLeaveData['type']): JoinLeaveData {
  return {
    type,
    embed: {
      title: t(this.guildLocale, `${type}_DEFAULT_TITLE`),
      description: t(this.guildLocale, 'JOINLEAVE_MESSAGE_DEFAULT_DESCRIPTION', {
        TYPE: t(this.guildLocale, type),
      }),
      color: colors.default,
    },
  };
}

export async function renderJoinLeavePrebuilder(
  this: CommandInteraction,
  type: JoinLeaveData['type']
) {
  if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator, true)) {
    return CRBTError(this, t(this.locale, 'ERROR_ADMIN_ONLY'));
  }

  const data = ((await prisma.servers.findFirst({
    where: { id: this.guildId },
    select: { [resolveMsgType[type]]: true },
  })) || {
    joinMessage: {
      embed: {
        title: t(this.guildLocale, `${type}_DEFAULT_TITLE`),
        description: t(this.guildLocale, 'JOINLEAVE_MESSAGE_DEFAULT_DESCRIPTION', {
          TYPE: t(this.guildLocale, type),
        }),
        color: await getColor(this.guild),
      },
    },
  }) as typeof type extends MessageBuilderTypes.joinMessage ? RawServerJoin : RawServerLeave;

  const builder = MessageBuilder({
    data: {
      ...data[resolveMsgType[type]],
      type,
    },
    interaction: this,
  });

  await this.reply(builder);
}

export async function renderJoinLeavePreview(
  this: CommandInteraction,
  type: 'JOIN_MESSAGE' | 'LEAVE_MESSAGE',
  data: RawServerJoin | RawServerLeave
) {
  const message: JoinLeaveData =
    data && type === MessageBuilderTypes.joinMessage ? data['joinMessage'] : data['leaveMessage'];

  if (!data || !message) {
    return CRBTError(
      this,
      t(this, 'ERROR_NO_MESSAGE', {
        COMMAND: slashCmd('settings'),
      })
    );
  }
  const channelId: string =
    type === MessageBuilderTypes.joinMessage ? data['joinChannel'] : data['leaveChannel'];

  if (!channelId) {
    return CRBTError(
      this,
      t(this, 'JOINLEAVE_PREVIEW_ERROR_NO_CHANNEL', {
        command: slashCmd('settings'),
        TYPE: t(this, type),
      })
    );
  }

  try {
    const channel = this.guild.channels.resolve(channelId) as TextChannel;

    const parsedMessage = parseCRBTscriptInMessage(message, {
      channel,
      member: this.member as GuildMember,
    });

    const { url } = await channel.send({
      allowedMentions: {
        users: [this.user.id],
      },
      ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
      embeds: [
        {
          title: t(this.guildLocale, 'JOINLEAVE_PREVIEW_EMBED_TITLE', {
            TYPE: t(this.guildLocale, type),
          }),
          color: await getColor(this.guild),
        },
        ...(message.embed ? [new MessageEmbed(parsedMessage.embed)] : []),
      ],
    });

    await this.reply({
      embeds: [
        {
          title: t(this, 'JOINLEAVE_PREVIEW_EMBED_TITLE', {
            TYPE: t(this, type),
          }),
          description: t(this, 'JOINLEAVE_PREVIEW_EMBED_DESCRIPTION', {
            TYPE: t(this, type).toLocaleLowerCase(this.locale),
            CHANNEL: channel.toString(),
          }),
          color: await getColor(this.guild),
        },
      ],
      components: components(
        row(new MessageButton().setLabel(t(this, 'JUMP_TO_MSG')).setURL(url).setStyle('LINK'))
      ),
      ephemeral: true,
    });
  } catch (e) {
    console.error(e);
    return CRBTError(
      this,
      t(this, 'JOINLEAVE_PREVIEW_ERROR_UNKNOWN', {
        TYPE: t(this, type),
      })
    );
  }
}
