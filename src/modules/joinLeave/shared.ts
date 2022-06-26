import { colors, db, emojis, icons, links } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { t } from '$lib/language';
import { APIEmbed, APIEmbedField } from 'discord-api-types/v10';
import {
  CommandInteraction,
  GuildMember,
  MessageButton,
  MessageEmbed,
  NewsChannel,
  PartialGuildMember,
  TextChannel,
  TextInputComponent,
} from 'discord.js';
import { ButtonComponent, components, ModalComponent, row, SelectMenuComponent } from 'purplet';
import { colorsMap } from '../settings/color set';

const invisibleChar = '‎';

export type MessageTypes = 'JOIN_MESSAGE' | 'LEAVE_MESSAGE';
export const resolveMsgType = {
  JOIN_MESSAGE: 'joinMessage',
  LEAVE_MESSAGE: 'leaveMessage',
};

export type JoinLeaveMessage = { script?: string; embed?: Partial<APIEmbed>; content?: string };

// [id, name, maxLength, markdownSupport, CRBTscriptSupport]
export const editableList: [string, number, boolean, boolean][] = [
  ['content', 2048, true, true],
  ['author', 256, false, true],
  ['title', 256, true, true],
  ['description', 2048, true, true],
  ['footer', 256, false, false],
  ['color', 7, false, false],
  ['image', 256, false, false],
  ['thumbnail', 256, false, false],
  ['url', 256, false, false],
];

export interface RawServerJoin {
  joinMessage?: JoinLeaveMessage;
  joinChannel?: string;
}

export interface RawServerLeave {
  leaveMessage?: JoinLeaveMessage;
  leaveChannel?: string;
}

export function getValue(message: { content?: string; embed?: APIEmbed }, id: string): string {
  switch (id) {
    case 'content':
      return message.content;
    case 'author':
      return message.embed?.author?.name;
    case 'footer':
      return message.embed?.footer?.text;
    case 'color':
      return message.embed?.color?.toString(16);
    case 'image':
      return message.embed?.image?.url;
    case 'thumbnail':
      return message.embed?.thumbnail?.url;
    default:
      return message.embed?.[id];
    // ?.length > 100
    //   ? `${message.embed[id].slice(0, 97)}...`
    //   : message.embed[id];
  }
}

export function parseCRBTscriptInMessage(
  message: JoinLeaveMessage,
  opts: {
    channel: TextChannel | NewsChannel;
    member: GuildMember | PartialGuildMember;
  }
): JoinLeaveMessage {
  if (message.content) {
    message.content = parseCRBTscript(message.content, opts);
  }

  if (message.embed) {
    const { embed } = message;
    const newEmbed: Partial<APIEmbed> = {
      author: embed.author,
      title: parseCRBTscript(embed.title, opts),
      description: parseCRBTscript(embed.description, opts),
      fields: embed.fields?.map((field: APIEmbedField) => ({
        name: parseCRBTscript(field.name, opts),
        value: parseCRBTscript(field.value, opts),
      })),
      thumbnail: embed.thumbnail ? { url: parseCRBTscript(embed.thumbnail?.url, opts) } : null,
      footer: embed.footer,
      color: embed.color,
      image: embed.image,
    };
    message.embed = newEmbed;
  }
  return message;
}

export async function renderJoinLeave(
  type: MessageTypes,
  message: JoinLeaveMessage,
  locale: string
) {
  message = message || {
    embed: {
      title: t(locale, `${type}_DEFAULT_TITLE`),
      description: t(locale, 'JOINLEAVE_MESSAGE_DEFAULT_DESCRIPTION').replace(
        '<TYPE>',
        t(locale, type)
      ),
      color: parseInt(colors.default, 16),
    },
  };

  const { DONE, PREVIEW } = t(locale, 'genericButtons');

  return {
    ephemeral: true,
    ...(message.content ? { content: message.content } : {}),
    embeds: message.embed ? [new MessageEmbed(message.embed)] : [],
    components: components(
      row(
        new FieldSelectMenu(type).setPlaceholder(t(locale, 'FIELD_SELECT_MENU')).setOptions(
          editableList.map(([id]) => {
            const description = getValue({ content: message.content, embed: message?.embed }, id);
            return {
              label: t(locale, `FIELDS_${id.toUpperCase()}` as any),
              value: id,
              description:
                description?.length > 100 ? `${description.slice(0, 97)}...` : description,
            };
          })
        )
      ),
      row(
        new SaveButton(type as never).setLabel(DONE).setStyle('SUCCESS'),
        new TestButton().setLabel(PREVIEW).setStyle('PRIMARY').setEmoji(emojis.buttons.preview),
        new MessageButton()
          .setURL(links.CRBTscript)
          .setStyle('LINK')
          .setLabel(t(locale, 'JOINLEAVE_MESSAGE_CRBTSCRIPT_GUIDE'))
      )
    ),
  };
}

export const FieldSelectMenu = SelectMenuComponent({
  handle(type: string) {
    const fieldName = this.values[0];
    const [id, maxLength, markdownSupport] = editableList.find(([id]) => id === fieldName)!;
    const { BACK } = t(this.locale, 'genericButtons');

    if (fieldName === 'color') {
      this.update({
        components: components(
          row(
            new ColorPresetSelectMenu()
              .setPlaceholder(t(this.locale, 'COLOR_PRESET_SELECT_MENU'))
              .setOptions(
                colorsMap
                  .filter((color) => !color.private && color.value !== 'profile')
                  .map((colorObj) => ({
                    label: colorObj.fullName,
                    value: colorObj.value,
                    emoji: colorObj.emoji,
                  }))
              )
          ),
          row(
            new BackButton(type as never)
              .setStyle('SECONDARY')
              .setLabel(BACK)
              .setEmoji(emojis.buttons.left_arrow),
            new ManualColorEditButton(type as never)
              .setStyle('PRIMARY')
              .setLabel(t(this.locale, 'MANUAL_COLOR_EDIT_BUTTON'))
          )
        ),
      });
    } else {
      const embed = this.message.embeds[0];
      const value = getValue(
        {
          embed: embed ? new MessageEmbed(this.message.embeds[0]).toJSON() : null,
          content: this.message.content,
        },
        fieldName
      );
      const name = t(this.locale, `FIELDS_${fieldName.toUpperCase()}` as any);
      const modal = new EditModal({ fieldName, type }).setTitle(`Edit ${name}`).setComponents(
        row(
          new TextInputComponent()
            .setLabel('Value')
            .setValue(value ?? '')
            .setCustomId('VALUE')
            .setStyle(maxLength <= 256 ? 'SHORT' : 'PARAGRAPH')
            .setMaxLength(maxLength)
            .setPlaceholder(markdownSupport ? t(this.locale, 'MARKDOWN_CRBTSCRIPT_SUPPORT') : '')
        )
      );

      this.showModal(modal);
    }
  },
});

export const TestButton = ButtonComponent({
  async handle() {
    const embed = this.message.embeds[0];
    const parsed = parseCRBTscriptInMessage(
      {
        content: this.message.content === invisibleChar ? null : this.message.content,
        embed: embed ? new MessageEmbed(embed).toJSON() : null,
      },
      {
        channel: this.channel as TextChannel,
        member: this.member as GuildMember,
      }
    );

    await this.reply({
      content: parsed.content,
      embeds: embed ? [new MessageEmbed(parsed.embed)] : [],
      ephemeral: true,
    });
  },
});

export const BackButton = ButtonComponent({
  async handle(type: MessageTypes) {
    const embed = this.message.embeds[0];
    this.update(
      await renderJoinLeave(
        type,
        {
          content: this.message.content,
          embed: embed ? new MessageEmbed(this.message.embeds[0]).toJSON() : null,
        },
        this.locale
      )
    );
  },
});

export const SaveButton = ButtonComponent({
  async handle(type: MessageTypes) {
    const embed = this.message.embeds[0];

    const data = {
      content: this.message.content === invisibleChar ? null : this.message.content,
      embed: embed
        ? {
            title: embed.title,
            description: embed.description,
            color: embed.color,
            fields: embed.fields,
            thumbnail: { url: embed.thumbnail?.url },
            image: { url: embed.image?.url },
            url: embed.url,
            author: { name: embed.author?.name },
            footer: { text: embed.footer?.text },
          }
        : null,
    };

    await db.servers.upsert({
      where: { id: this.guildId },
      update: {
        [resolveMsgType[type]]: data,
      },
      create: {
        id: this.guildId,
        [resolveMsgType[type]]: data,
      },
    });

    await this.update({
      content: '‎',
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this.locale, 'JOINLEAVE_MESSAGE_SAVE_TITLE').replace(
              '<TYPE>',
              t(this.locale, type)
            ),
            iconURL: icons.success,
          })
          .setDescription(t(this.locale, `${type}_SAVE_DESCRIPTION`))
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });
  },
});

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const value = this.values[0];

    this.update({
      embeds: [new MessageEmbed(this.message.embeds[0]).setColor(`#${value}`)],
    });
  },
});

export const ManualColorEditButton = ButtonComponent({
  handle(type: MessageTypes) {
    const [id, maxLength] = editableList.find(([id]) => id === 'color')!;

    this.showModal(
      new EditModal({ fieldName: id, type })
        .setTitle(`Edit ${t(this, `FIELDS_${id.toUpperCase()}` as any)}`)
        .setComponents(
          row(
            new TextInputComponent()
              .setLabel('Value')
              .setCustomId('VALUE')
              .setStyle(maxLength > 256 ? 'SHORT' : 'PARAGRAPH')
              .setMaxLength(maxLength)
          )
        )
    );
  },
});

export const EditModal = ModalComponent({
  async handle({ fieldName, type }) {
    const value = this.fields.getTextInputValue('VALUE');

    const embed = this.message.embeds[0] || {};
    let content = this.message.content;

    const invalidURL = t(this, 'ERROR_INVALID_URL');
    const urlRegex = /^https?:(?:\/\/)\S+$/;

    const parsed = parseCRBTscript(value, {
      channel: this.channel as TextChannel,
      member: this.member as GuildMember,
    });

    switch (fieldName) {
      case 'content':
        content = value || invisibleChar;
        break;
      case 'author':
        embed.author = { name: value };
        break;
      case 'footer':
        embed.footer = { text: value };
        break;
      case 'image':
        if (value && !urlRegex.test(parsed)) {
          return this.reply(CRBTError(invalidURL));
        }
        embed.image = { url: parsed };
        break;
      case 'thumbnail':
        if (value && !urlRegex.test(parsed)) {
          return this.reply(CRBTError(invalidURL));
        }
        embed.thumbnail = { url: parsed };
        break;
      case 'url':
        if (!urlRegex.test(value)) {
          return this.reply(CRBTError(invalidURL));
        }

        embed.url = value ?? '';
        break;
      case 'color':
        if (!value.match(/^#?[0-9a-fA-F]{6}$/)) {
          return this.reply(CRBTError(t(this, 'ERROR_INVALID_HEX')));
        }
        embed.color = parseInt(value.replace('#', ''), 16);
        break;
      default:
        embed[fieldName] = value;
    }

    const textInEmbed =
      embed && !!(embed.author?.name || embed.description || embed.title || embed.footer?.text);

    console.log('doesEmbedHaveText', textInEmbed);
    console.log('isContentInvisible', content === invisibleChar);
    console.log('isThereAnyContent', !!content);
    console.log('whatsTheContent', JSON.stringify(content));

    if (content !== invisibleChar && !(content || textInEmbed)) {
      return this.reply(CRBTError(t(this, 'JOINLEAVE_MESSAGE_ERROR_MSG_EMPTY')));
    }

    this.update(
      await renderJoinLeave(
        type,
        {
          content,
          embed: textInEmbed ? new MessageEmbed(embed).toJSON() : null,
        },
        this.locale
      )
    );
  },
});

export async function renderJoinLeavePreview<M extends MessageTypes>(
  this: CommandInteraction,
  type: M,
  data: M extends 'JOIN_MESSAGE' ? RawServerJoin : RawServerLeave
) {
  const { JUMP_TO_MSG } = t(this, 'genericButtons');

  if (!data) {
    return this.reply(
      CRBTError(
        t(this, 'LEAVE_PREVIEW_ERROR_NO_MESSAGE').replace('<TYPE>', t(this, type)).toLowerCase()
      )
    );
  }
  const channelId: string = type === 'JOIN_MESSAGE' ? data['joinChannel'] : data['leaveChannel'];
  const message: JoinLeaveMessage =
    type === 'JOIN_MESSAGE' ? data['joinMessage'] : data['leaveMessage'];

  if (!channelId) {
    return this.reply(
      CRBTError(
        t(this, 'LEAVE_PREVIEW_ERROR_NO_CHANNEL').replace('<TYPE>', t(this, type)).toLowerCase()
      )
    );
  }

  console.log(message);

  try {
    const channel = this.guild.channels.resolve(channelId) as TextChannel | NewsChannel;

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
