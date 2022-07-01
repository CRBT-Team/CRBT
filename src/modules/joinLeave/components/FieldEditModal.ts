import { CRBTError } from '$lib/functions/CRBTError';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ImageUrlRegex, UrlRegex } from '$lib/util/regex';
import { GuildMember, TextChannel } from 'discord.js';
import { ModalComponent } from 'purplet';
import { joinBuilderCache, renderJoinLeaveBuilder } from '../renderers';
import { toJoinLeaveMessage } from '../utility/toJoinLeaveMessage';

export const FieldEditModal = ModalComponent({
  async handle({ fieldName, type }) {
    const value = this.fields.getTextInputValue('VALUE');

    const data = joinBuilderCache.get(this.guildId);
    const { embed } = { ...data };
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
          return this.reply(CRBTError(invalidURL));
        }
        embed.image = { url: value };
        break;
      case 'thumbnail':
        if (value && !ImageUrlRegex.test(parsed)) {
          return this.reply(CRBTError(invalidURL));
        }
        embed.thumbnail = { url: value };
        break;
      case 'url':
        if (value && !UrlRegex.test(value)) {
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

    const noTextInMessage = content !== invisibleChar && !(content || textInEmbed);

    console.log('noTextInMessage', noTextInMessage);
    console.log('doesEmbedHaveText', textInEmbed);
    console.log('isContentInvisible', content === invisibleChar);
    console.log('isThereAnyContent', !!content);
    console.log('whatsTheContent', JSON.stringify(content));

    const cleanMessage = toJoinLeaveMessage({
      content: content,
      embeds: textInEmbed ? [embed] : [],
    });
    console.log('cleanMessage', cleanMessage);

    if (noTextInMessage) {
      return this.reply(CRBTError(t(this, 'JOINLEAVE_MESSAGE_ERROR_MSG_EMPTY')));
    }

    this.update(await renderJoinLeaveBuilder.call(this, type, cleanMessage));
  },
});
