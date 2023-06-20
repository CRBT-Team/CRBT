import { cache, fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { MessageBuilderData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { EditableUserSettings } from '$lib/types/user-settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ImageUrlRegex, UrlRegex } from '$lib/util/regex';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { ModalComponent } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';
import { guildFeatureSettings } from '../../settings/server-settings/settings';
import { saveServerSettings } from '../../settings/server-settings/_helpers';
import { userFeatureSettings } from '../../settings/user-settings/settings';

export const FieldEditModal = ModalComponent({
  async handle({
    fieldName,
    type,
  }: {
    fieldName: string;
    type:
      | MessageBuilderTypes
      | EditableGuildFeatures.automaticTheming
      | EditableUserSettings.accentColor;
  }) {
    let value: string = this.fields.getTextInputValue('VALUE');

    if (type === EditableGuildFeatures.automaticTheming) {
      value = value.toLowerCase().replace('#', '');
      if (!value.match(/^[0-9a-f]{6}$/)) {
        return CRBTError(this, { title: t(this, 'ERROR_INVALID_COLOR') });
      }

      await saveServerSettings(this.guildId, {
        accentColor: parseInt(value, 16),
      });

      return await this.update(
        await guildFeatureSettings.call(this, EditableGuildFeatures.automaticTheming)
      );
    }
    if (type === EditableUserSettings.accentColor) {
      value = value.toLowerCase().replace('#', '');
      if (!value.match(/^[0-9a-f]{6}$/)) {
        return CRBTError(this, { title: t(this, 'ERROR_INVALID_COLOR') });
      }

      cache.set(`color:${this.user.id}`, value);
      await fetchWithCache(
        `user:${this.user.id}`,
        () =>
          prisma.user.upsert({
            create: { id: this.user.id, accentColor: parseInt(value, 16) },
            update: { accentColor: parseInt(value, 16) },
            where: { id: this.user.id },
          }),
        true
      );

      return await this.update(
        await userFeatureSettings.call(this, EditableUserSettings.accentColor)
      );
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
