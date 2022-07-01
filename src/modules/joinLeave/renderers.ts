import { colors, links } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  MessageButton,
  MessageEmbed,
  ModalSubmitInteraction,
  TextChannel,
} from 'discord.js';
import { components, row } from 'purplet';
import { ExportJSONButton } from './components/ExportJSONButton';
import { FieldSelectMenu } from './components/FieldSelectMenu';
import { ImportJSONButton } from './components/ImportJSONButton';
import { SaveButton } from './components/SaveButton';
import {
  editableList,
  JoinLeaveMessage,
  MessageTypes,
  RawServerJoin,
  RawServerLeave,
} from './types';
import { getFieldValue } from './utility/getFieldValue';
import { parseCRBTscriptInMessage } from './utility/parseCRBTscriptInMessage';

export const joinBuilderCache = new Map<string, JoinLeaveMessage>();

export async function renderJoinLeaveBuilder(
  this: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
  type: MessageTypes,
  message: JoinLeaveMessage
) {
  const isEmpty = !message;
  console.log(isEmpty);
  message = message || {
    embed: {
      title: t(this.guildLocale, `${type}_DEFAULT_TITLE`),
      description: t(this.guildLocale, 'JOINLEAVE_MESSAGE_DEFAULT_DESCRIPTION').replace(
        '<TYPE>',
        t(this.guildLocale, type)
      ),
      color: parseInt(colors.default, 16),
    },
  };

  joinBuilderCache.set(this.guildId, message);

  console.log('message', message);

  const parsed = parseCRBTscriptInMessage(message, {
    channel: this.channel,
    member: this.member as GuildMember,
  });

  console.log('message2', message);

  const { SAVE, IMPORT, EXPORT } = t(this, 'genericButtons');

  const fieldSelect = new FieldSelectMenu(type)
    .setPlaceholder(t(this, 'FIELD_SELECT_MENU'))
    .setOptions(
      editableList
        .map(([id]) => {
          if (id === 'author_name') {
            return {
              label: t(this.guildLocale, `FIELDS_AUTHOR`),
              value: 'author',
              description: getFieldValue(message, 'author_name'),
            };
          }
          if (id.startsWith('author_')) {
            return null;
          }
          const description = getFieldValue(message, id);
          return {
            label: t(this, `FIELDS_${id.toUpperCase()}` as any),
            value: id,
            description: description?.length > 100 ? `${description.slice(0, 97)}...` : description,
          };
        })
        .filter(Boolean)
    );

  return {
    allowedMentions: {
      users: [this.user.id],
    },
    ephemeral: true,
    content: message.content ? parsed.content : invisibleChar,
    embeds: message.embed ? [new MessageEmbed(parsed.embed)] : [],
    components: components(
      row(fieldSelect),
      row(
        new SaveButton(type as never).setLabel(SAVE).setStyle('SUCCESS'),
        new ExportJSONButton(type as never)
          .setLabel(EXPORT)
          .setStyle('SECONDARY')
          .setDisabled(isEmpty),
        new ImportJSONButton(type as never).setLabel(IMPORT).setStyle('SECONDARY')
      ),
      row(
        // new TestButton().setLabel(PREVIEW).setStyle('PRIMARY').setEmoji(emojis.buttons.preview),
        new MessageButton()
          .setURL(links.CRBTscript)
          .setStyle('LINK')
          .setLabel(t(this, 'JOINLEAVE_MESSAGE_CRBTSCRIPT_GUIDE'))
      )
    ),
    files: [],
  };
}

export async function renderJoinLeavePreview<M extends MessageTypes>(
  this: CommandInteraction,
  type: M,
  data: M extends 'JOIN_MESSAGE' ? RawServerJoin : RawServerLeave
) {
  const { JUMP_TO_MSG } = t(this, 'genericButtons');

  const message: JoinLeaveMessage =
    data && type === 'JOIN_MESSAGE' ? data['joinMessage'] : data['leaveMessage'];

  if (!data || !message) {
    return this.reply(
      CRBTError(
        t(
          this,
          type === 'JOIN_MESSAGE'
            ? 'JOIN_PREVIEW_ERROR_NO_MESSAGE'
            : 'LEAVE_PREVIEW_ERROR_NO_MESSAGE'
        ).replace('<TYPE>', t(this, type))
      )
    );
  }
  const channelId: string = type === 'JOIN_MESSAGE' ? data['joinChannel'] : data['leaveChannel'];

  if (!channelId) {
    return this.reply(
      CRBTError(
        t(
          this,
          type === 'JOIN_MESSAGE'
            ? 'JOIN_PREVIEW_ERROR_NO_CHANNEL'
            : 'LEAVE_PREVIEW_ERROR_NO_CHANNEL'
        ).replace('<TYPE>', t(this, type))
      )
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
        new MessageEmbed()
          .setAuthor({
            name: t(this.guildLocale, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace(
              '<TYPE>',
              t(this.guildLocale, type)
            ),
          })
          .setColor(`#${colors.default}`),
        ...(message.embed ? [new MessageEmbed(parsedMessage.embed)] : []),
      ],
    });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace('<TYPE>', t(this, type)),
            iconURL: this.guild.iconURL(),
          })
          .setDescription(
            t(this, 'JOINLEAVE_PREVIEW_EMBED_DESCRIPTION')
              .replace('<TYPE>', t(this, type))
              .replace('<CHANNEL>', channel.toString())
          )
          .setColor(`#${colors.default}`),
      ],
      components: components(
        row(new MessageButton().setLabel(JUMP_TO_MSG).setURL(url).setStyle('LINK'))
      ),
      ephemeral: true,
    });
  } catch (e) {
    console.error(e);
    return this.reply(
      CRBTError(t(this, 'JOINLEAVE_PREVIEW_ERROR_UNKNOWN').replace('<TYPE>', t(this, type)))
    );
  }
}
