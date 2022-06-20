import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { APIEmbed, APIEmbedField } from 'discord-api-types/v10';
import {
  GuildMember,
  MessageEmbed,
  NewsChannel,
  PartialGuildMember,
  TextChannel,
} from 'discord.js';

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

export function getValue(message: { content?: string; embed?: MessageEmbed }, id: string): string {
  switch (id) {
    case 'content':
      return message.content;
    case 'author':
      return message.embed.author?.name;
    case 'footer':
      return message.embed.footer?.text;
    case 'color':
      return message.embed.hexColor;
    case 'image':
      return message.embed.image?.url;
    case 'thumbnail':
      return message.embed.thumbnail?.url;
    default:
      return message.embed[id];
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
    const newEmbed: Partial<APIEmbed> = {
      author: message.embed.author,
      title: parseCRBTscript(message.embed.title, opts),
      description: parseCRBTscript(message.embed.description, opts),
      fields: message.embed.fields?.map((field: APIEmbedField) => ({
        name: parseCRBTscript(field.name, opts),
        value: parseCRBTscript(field.value, opts),
      })),
      footer: message.embed.footer,
      color: message.embed.color,
      image: message.embed.image,
    };
    message.embed = newEmbed;
  }
  return message;
}
