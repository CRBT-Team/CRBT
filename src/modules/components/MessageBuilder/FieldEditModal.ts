import { cache } from '$lib/cache';
import { CRBTError } from '$lib/functions/CRBTError';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { t } from '$lib/language';
import { MessageBuilderData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { EditableFeatures } from '$lib/types/settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ImageUrlRegex, UrlRegex } from '$lib/util/regex';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { ModalComponent } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';
import { saveColorSettings } from '../../settings/serverSettings/accentColor';

export const FieldEditModal = ModalComponent({
  async handle({
    fieldName,
    type,
  }: {
    fieldName: string;
    type: MessageBuilderTypes | EditableFeatures.accentColor;
  }) {
    let value: string = this.fields.getTextInputValue('VALUE');

    if (type === EditableFeatures.accentColor) {
      value = value.toLowerCase().replace('#', '');
      if (!value.match(/^[0-9a-f]{6}$/)) {
        return CRBTError(this, { title: t(this, 'ERROR_INVALID_COLOR') });
      }
      return await saveColorSettings.call(this, parseInt(value, 16));
    }

    const data = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    const embed = data.embed || new MessageEmbed();
    let content = data.content;

    const invalidURL = t(this, 'ERROR_INVALID_URL');

    const parsed = parseCRBTscript(value, {
      channel: this.channel as TextChannel,
      member: this.member as GuildMember,
    });

    switch (fieldName) {
      case 'content':
        content = value || invisibleChar;
        break;
      case 'footer':
        embed.footer = { text: value };
        break;
      case 'image':
        if (value && !ImageUrlRegex.test(parsed)) {
          return CRBTError(this, { title: invalidURL });
        }
        embed.image = { url: value };
        break;
      case 'thumbnail':
        if (value && !ImageUrlRegex.test(parsed)) {
          return CRBTError(this, { title: invalidURL });
        }
        embed.thumbnail = { url: value };
        break;
      case 'url':
        if (value && !UrlRegex.test(value)) {
          return CRBTError(this, { title: invalidURL });
        }

        embed.url = value ?? '';
        break;
      case 'color':
        if (!value.match(/^#?[0-9a-fA-F]{6}$/)) {
          return CRBTError(this, { title: t(this, 'ERROR_INVALID_COLOR') });
        }
        embed.color = parseInt(value.replace('#', ''), 16);
        break;
      default:
        embed[fieldName] = value;
    }

    const textInEmbed =
      embed && !!(embed.author?.name || embed.description || embed.title || embed.footer?.text);

    const noTextInMessage = content !== invisibleChar && !(content || textInEmbed);

    // console.log('noTextInMessage', noTextInMessage);
    // console.log('doesEmbedHaveText', textInEmbed);
    // console.log('isContentInvisible', content === invisibleChar);
    // console.log('isThereAnyContent', !!content);
    // console.log('whatsTheContent', JSON.stringify(content));

    if (noTextInMessage) {
      return CRBTError(this, { title: t(this, 'JOINLEAVE_MESSAGE_ERROR_MSG_EMPTY') });
    }

    const builder = MessageBuilder({
      data: {
        ...data,
        content,
        embed: textInEmbed ? embed : null,
      },
      interaction: this,
    });

    this.update(builder);
  },
});
