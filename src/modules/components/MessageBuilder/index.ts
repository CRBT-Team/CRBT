import { cache } from '$lib/cache';
import { emojis, links } from '$lib/db';
import { t } from '$lib/language';
import {
  editableList,
  MessageBuilderData,
  MessageBuilderProps,
  MessageBuilderTypes,
} from '$lib/types/messageBuilder';
import { invisibleChar } from '$lib/util/invisibleChar';
import { GuildMember, GuildTextBasedChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, row } from 'purplet';
import { ExportJSONButton } from '../../joinLeave/components/ExportJSONButton';
import { ImportJSONButton } from '../../joinLeave/components/ImportJSONButton';
import { BackSettingsButton } from '../../settings/serverSettings/settings';
import { FieldSelectMenu } from './FieldSelectMenu';
import { getFieldValue } from './getFieldValue';
import { parseCRBTscriptInMessage } from './parseCRBTscriptInMessage';
import { SaveButton } from './SaveButton';
import { SendMessageButton } from './SendMessageButton';

export function MessageBuilder({ data, interaction: i }: MessageBuilderProps) {
  const { type } = data;

  cache.set<MessageBuilderData>(`${type}_BUILDER:${i.guildId}`, data);

  const parsed =
    type === MessageBuilderTypes.rolePicker
      ? data
      : parseCRBTscriptInMessage(data, {
        channel: i.channel as GuildTextBasedChannel,
        member: i.member as GuildMember,
      });

  const { SAVE, IMPORT, EXPORT, SEND } = t(i, 'genericButtons');

  const fieldSelect = new FieldSelectMenu(type as never)
    .setPlaceholder(t(i, 'FIELD_SELECT_MENU'))
    .setOptions(
      editableList
        .map(([id]) => {
          if (id === 'author_name') {
            return {
              label: t(i.guildLocale, `FIELDS_AUTHOR`),
              value: 'author',
              description: getFieldValue(data, 'author_name'),
            };
          }
          if (id.startsWith('author_')) {
            return null;
          }
          const description = getFieldValue(data, id);
          return {
            label: t(i, `FIELDS_${id.toUpperCase()}` as any),
            value: id,
            description: description?.length > 100 ? `${description.slice(0, 97)}...` : description,
          };
        })
        .filter(Boolean)
    );

  const buttons = {
    back: new BackSettingsButton(type)
      .setLabel(t(i, 'SETTINGS'))
      .setEmoji(emojis.buttons.left_arrow)
      .setStyle('SECONDARY'),
    save:
      type !== MessageBuilderTypes.rolePicker
        ? new SaveButton(type as never).setLabel(SAVE).setStyle('SUCCESS')
        : new SendMessageButton(type as never).setLabel(SEND).setStyle('SUCCESS'),
    import: new ImportJSONButton(type as never).setLabel(IMPORT).setStyle('SECONDARY'),
    export: new ExportJSONButton(type as never).setLabel(EXPORT).setStyle('SECONDARY'),
    CRBTscript: new MessageButton()
      .setURL(links.CRBTscript)
      .setStyle('LINK')
      .setLabel(t(i, 'CRBTSCRIPT_GUIDE')),
  };

  return {
    allowedMentions: {
      users: [i.user.id],
    },
    ephemeral: true,
    content: data.content ? parsed.content : invisibleChar,
    embeds: data.embed ? [new MessageEmbed(parsed.embed)] : [],
    components: components(
      ...[
        type === MessageBuilderTypes.rolePicker ? data.components[0] : null,
        row(fieldSelect),
        ...(type !== MessageBuilderTypes.rolePicker
          ? [
            row(buttons.back, buttons.save, buttons.import, buttons.export),
            row(buttons.CRBTscript),
          ]
          : [row(buttons.save)]),
      ].filter(Boolean)
    ),
    files: [],
  };
}
