import { colors } from '$lib/env';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { CamelCaseGuildFeatures, EditableGuildFeatures } from '$lib/types/guild-settings';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import {
  CommandInteraction,
  GuildMember,
  Interaction,
  MessageButton,
  MessageComponentInteraction,
  TextChannel,
} from 'discord.js';
import { components, row } from 'purplet';
import { parseCRBTscriptInMessage } from '../components/MessageBuilder/parseCRBTscriptInMessage';
import { RawServerJoin, RawServerLeave } from './types';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { getServerMember } from '../economy/_helpers';

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

export async function renderJoinLeavePreview(
  this: CommandInteraction | MessageComponentInteraction,
  type: JoinLeaveData['type'],
  data: RawServerJoin | RawServerLeave,
) {
  const message: JoinLeaveData = data[CamelCaseGuildFeatures[type]];

  const channelId: string =
    type === EditableGuildFeatures.joinMessage ? data['joinChannel'] : data['leaveChannel'];

  try {
    const channel = this.guild.channels.resolve(channelId) as TextChannel;
    const member = this.member as GuildMember;
    const guildSettings = await getGuildSettings(this.guild.id);
    const crbtGuildMember = await getServerMember(member.id, this.guild.id);

    const parsedMessage = parseCRBTscriptInMessage(message, {
      channel,
      member,
      crbtGuildMember,
      guildSettings,
    });

    const { url } = await channel.send({
      allowedMentions: {
        users: [this.user.id],
      },
      ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
      embeds: [
        {
          title: `${t(this, type)} - ${t(this, 'PREVIEW')}`,
          color: await getColor(this.guild),
        },
        ...(message.embed ? [parsedMessage.embed] : []),
      ],
    });

    await this.reply({
      embeds: [
        {
          title: `${t(this, type)} - ${t(this, 'PREVIEW')}`,
          description: t(this, 'JOINLEAVE_PREVIEW_EMBED_DESCRIPTION', {
            TYPE: t(this, type).toLocaleLowerCase(this.locale),
            CHANNEL: channel.toString(),
          }),
          color: await getColor(this.guild),
        },
      ],
      components: components(
        row(new MessageButton().setLabel(t(this, 'JUMP_TO_MSG')).setURL(url).setStyle('LINK')),
      ),
      ephemeral: true,
    });
  } catch (e) {
    return this.reply(UnknownError(this, e));
  }
}
