import { APIEmbed } from 'discord-api-types/v10';
import { MessageEmbed } from 'discord.js';
import { editableNames } from './types';

export function getFieldValue(
  message: { content?: string; embed?: APIEmbed | MessageEmbed },
  id: editableNames
): string | undefined {
  const { content, embed } = message;
  switch (id) {
    case 'content':
      return content;
    case 'author_name':
      return embed?.author?.name;
    case 'author_url':
      return embed?.author?.url;
    case 'author_icon':
      return embed?.author?.[embed instanceof MessageEmbed ? 'iconURL' : 'icon_url'];
    case 'footer':
      return embed?.footer?.text;
    case 'color':
      return embed?.color?.toString(16);
    case 'image':
      return embed?.image?.url;
    case 'thumbnail':
      return embed?.thumbnail?.url;
    default:
      return embed?.[id];
  }
}
