import { cache } from '$lib/cache';
import { links } from '$lib/db';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { GuildMember, GuildTextBasedChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, row } from 'purplet';
import { ExportJSONButton } from '../../joinLeave/components/ExportJSONButton';
import { ImportJSONButton } from '../../joinLeave/components/ImportJSONButton';
import { FieldSelectMenu } from './FieldSelectMenu';
import { getFieldValue } from './getFieldValue';
import { parseCRBTscriptInMessage } from './parseCRBTscriptInMessage';
import { SaveButton } from './SaveButton';
import {
  editableList,
  MessageBuilderData,
  MessageBuilderProps,
  MessageBuilderTypes,
} from './types';

export function MessageBuilder({ data, interaction: i }: MessageBuilderProps) {
  const { type } = data;

  console.log(data);

  cache.set<MessageBuilderData>(`${type}_BUILDER:${i.guildId}`, data);

  const parsed = parseCRBTscriptInMessage(data, {
    channel: i.channel as GuildTextBasedChannel,
    member: i.member as GuildMember,
  });

  const { SAVE, IMPORT, EXPORT } = t(i, 'genericButtons');

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
        row(
          new SaveButton(type as never).setLabel(SAVE).setStyle('SUCCESS'),
          ...(type !== 'ROLE_PICKER'
            ? [
                new ExportJSONButton(type as never).setLabel(EXPORT).setStyle('SECONDARY'),
                new ImportJSONButton(type as never).setLabel(IMPORT).setStyle('SECONDARY'),
              ]
            : [])
        ),
        row(
          new MessageButton()
            .setURL(links.CRBTscript)
            .setStyle('LINK')
            .setLabel(t(i, 'CRBTSCRIPT_GUIDE'))
        ),
      ].filter(Boolean)
    ),
    files: [],
  };
}
