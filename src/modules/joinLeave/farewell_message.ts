import { colors, db, emojis, icons, links } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  GuildMember,
  MessageButton,
  MessageEmbed,
  NewsChannel,
  TextChannel,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  row,
  SelectMenuComponent,
} from 'purplet';
import { colorsMap } from '../settings/color set';
import {
  editableList,
  getValue,
  JoinLeaveMessage,
  parseCRBTscriptInMessage,
  RawServerLeave,
} from './shared';

export default ChatCommand({
  name: 'farewell message',
  description: t('en-US', 'LEAVE_MESSAGE_DESCRIPTION'),
  async handle() {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
      return this.reply(CRBTError(t('en-US', 'ERROR_ADMIN_ONLY')));
    }

    const data = (await db.servers.findFirst({
      where: { id: this.guildId },
      select: { leaveMessage: true },
    })) as RawServerLeave;

    await this.reply(await render(data?.leaveMessage, this.locale));
  },
});

async function render(message: JoinLeaveMessage, locale: string) {
  message = message || {
    embed: {
      title: t(locale, 'LEAVE_MESSAGE_DEFAULT_TITLE'),
      description: t(locale, 'JOINLEAVE_MESSAGE_DEFAULT_DESCRIPTION').replace(
        '<TYPE>',
        t(locale, 'LEAVE_MESSAGE')
      ),
      color: parseInt(colors.default, 16),
    },
  };

  const { DONE, PREVIEW } = t(locale, 'genericButtons');

  return {
    ephemeral: true,
    ...(message.content ? { content: message.content } : {}),
    embeds: [new MessageEmbed(message.embed)],
    components: components(
      row(
        new FieldSelectMenu().setPlaceholder(t(locale, 'FIELD_SELECT_MENU')).setOptions(
          editableList.map(([id]) => {
            return {
              label: t(locale, `FIELDS_${id.toUpperCase()}` as any),
              value: id,
              description: getValue(
                { content: message.content, embed: new MessageEmbed(message?.embed) },
                id
              ),
            };
          })
        )
      ),
      row(
        new SaveButton().setLabel(DONE).setStyle('SUCCESS'),
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
  handle(ctx: null) {
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
          row(new BackButton().setStyle('SECONDARY').setLabel(BACK)),
          new ManualColorEditButton()
            .setStyle('PRIMARY')
            .setLabel(t(this.locale, 'MANUAL_COLOR_EDIT_BUTTON'))
        ),
      });
    } else {
      const value = getValue(
        { embed: new MessageEmbed(this.message.embeds[0]), content: this.message.content },
        fieldName
      );
      const name = t(this.locale, `FIELDS_${fieldName.toUpperCase()}` as any);
      const modal = new EditModal(fieldName).setTitle(`Edit ${name}`).setComponents(
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
    const parsed = parseCRBTscriptInMessage(
      {
        content: this.message.content,
        embed: new MessageEmbed(this.message.embeds[0]).toJSON(),
      },
      {
        channel: this.channel as TextChannel | NewsChannel,
        member: this.member as GuildMember,
      }
    );

    await this.reply({
      content: parsed.content || '‎',
      embeds: [new MessageEmbed(parsed.embed)],
      ephemeral: true,
    });
  },
});

export const BackButton = ButtonComponent({
  async handle() {
    this.update(
      await render(
        {
          content: this.message.content,
          embed: new MessageEmbed(this.message.embeds[0]).toJSON(),
        },
        this.locale
      )
    );
  },
});

export const SaveButton = ButtonComponent({
  async handle() {
    const embed = this.message.embeds[0];

    const data = {
      content: this.message.content,
      embed: {
        title: embed.title,
        description: embed.description,
        color: embed.color,
        fields: embed.fields,
        thumbnail: { url: embed.thumbnail?.url },
        image: { url: embed.image?.url },
        url: embed.url,
        author: { name: embed.author?.name },
        footer: { text: embed.footer?.text },
      },
    };

    await db.servers.upsert({
      where: { id: this.guildId },
      update: { leaveMessage: data as any, modules: { push: 'LEAVE_MESSAGE' } },
      create: { id: this.guildId, leaveMessage: data as any, modules: 'LEAVE_MESSAGE' },
    });

    await this.update({
      content: null,
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this.locale, 'JOINLEAVE_MESSAGE_SAVE_TITLE').replace(
              '<TYPE>',
              t(this.locale, 'LEAVE_MESSAGE')
            ),
            iconURL: icons.success,
          })
          .setDescription(t(this.locale, 'LEAVE_MESSAGE_SAVE_DESCRIPTION'))
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
  handle() {
    const [id, maxLength] = editableList.find(([id]) => id === 'color')!;

    this.showModal(
      new EditModal(id)
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
  async handle(fieldName: string) {
    const value = this.fields.getTextInputValue('VALUE');

    const newMsg = {
      embed: new MessageEmbed(this.message.embeds[0]).toJSON(),
      content: this.message.content,
    };

    const invalidURL = t(this, 'ERROR_INVALID_URL');

    switch (fieldName) {
      case 'content':
        newMsg.content = value ?? '‎';
        break;
      case 'author':
        newMsg.embed.author = { name: value };
        break;
      case 'footer':
        newMsg.embed.footer = { text: value };
        break;
      case 'image':
        if (value && !value.match(/^https?:\/\/\S+/)) {
          return this.reply(CRBTError(invalidURL));
        }
        newMsg.embed.image = { url: value };
        break;
      case 'thumbnail':
        if (!value.match(/^https?:\/\/\S+/)) {
          return this.reply(CRBTError(invalidURL));
        }
        newMsg.embed.thumbnail = { url: value };
        break;
      case 'url':
        if (!value.match(/^https?:\/\/\S+/)) {
          return this.reply(CRBTError(invalidURL));
        }

        newMsg.embed.url = value ?? '';
        break;
      case 'color':
        if (!value.match(/^#?[0-9a-fA-F]{6}$/)) {
          return this.reply(CRBTError(t(this, 'ERROR_INVALID_HEX')));
        }
        newMsg.embed.color = parseInt(value.replace('#', ''), 16);
        break;
      default:
        newMsg.embed[fieldName] = value;
    }

    this.update(await render(newMsg, this.locale));
  },
});
