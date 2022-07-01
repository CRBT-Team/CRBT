import { invisibleChar } from '$lib/util/invisibleChar';
import { APIMessage } from 'discord-api-types/v10';
import { Message } from 'discord.js';
import { JoinLeaveMessage } from '../types';

export function toJoinLeaveMessage(message: APIMessage | Message | any): JoinLeaveMessage {
  const { content, embeds } = message;
  const embed = embeds?.[0];

  const value = {
    content: content === invisibleChar ? null : content,
    embed: embed
      ? {
          author: {
            name: embed?.author?.name,
            url: embed?.author?.url,
            icon_url: embed?.author?.iconURL || embed?.author?.icon_url,
          },
          title: embed?.title,
          description: embed?.description,
          fields: embed?.fields,
          footer: embed?.footer,
          image: embed?.image,
          thumbnail: embed?.thumbnail,
          url: embed?.url,
          color: embed?.color,
        }
      : null,
  };

  return value;
}
