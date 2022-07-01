import { CRBTscriptParserArgs, parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { APIEmbedField } from 'discord-api-types/v10';
import { JoinLeaveMessage } from '../types';

export function parseCRBTscriptInMessage(
  message: JoinLeaveMessage,
  args: CRBTscriptParserArgs
): JoinLeaveMessage {
  const parsed: JoinLeaveMessage = {};

  if (message.script) {
    parseCRBTscript(message.script, args);
  }

  if (message.content) {
    parsed.content = parseCRBTscript(message.content, args);
  }

  if (message.embed) {
    const { embed } = message;
    parsed.embed = {
      author: {
        name: parseCRBTscript(embed.author?.name, args),
        url: embed.author?.url,
        icon_url: parseCRBTscript(embed.author?.icon_url, args),
      },
      title: parseCRBTscript(embed.title, args),
      description: parseCRBTscript(embed.description, args),
      fields: embed.fields?.map((field: APIEmbedField) => ({
        name: parseCRBTscript(field.name, args),
        value: parseCRBTscript(field.value, args),
      })),
      thumbnail: embed.thumbnail ? { url: parseCRBTscript(embed.thumbnail?.url, args) } : null,
      image: embed.image ? { url: parseCRBTscript(embed.image?.url, args) } : null,
      footer: {
        text: parseCRBTscript(embed.footer?.text, args),
      },
      color: embed.color,
      url: embed.url,
    };
  }
  return parsed;
}
