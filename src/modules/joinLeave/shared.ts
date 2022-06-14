// import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
// import { APIEmbed, APIEmbedAuthor, APIEmbedField } from 'discord-api-types/v10';
// import { GuildMember, GuildTextBasedChannel, MessageEmbed } from 'discord.js';

// export type JoinLeaveMessage = { script?: string; embed?: Partial<APIEmbed>; content?: string };

// export const editableList: [string, string, number, boolean, boolean][] = [
//   // [id, name, maxLength, markdownSupport, CRBTscriptSupport]
//   ['content', 'Plain Text', 2048, true, true],
//   ['author', 'Embed Author', 256, false, true],
//   ['title', 'Embed Title', 256, true, true],
//   ['description', 'Embed Description', 2048, true, true],
//   // ['field_name', 'Name', 256, true],
//   // ['field_value', 'Value', 2048, true],
//   ['footer', 'Embed Footer', 256, false, false],
//   ['color', 'Embed Color', 7, false, false],
//   ['image', 'Embed Image', 256, false, false],
//   ['thumbnail', 'Embed Thumbnail', 256, false, false],
//   ['url', 'Embed Title URL', 256, false, false],
// ];

// export interface RawServerJoin {
//   joinMessage?: JoinLeaveMessage;
//   joinChannel?: string;
// }

// export interface RawServerLeave {
//   leaveMessage?: JoinLeaveMessage;
//   leaveChannel?: string;
// }

// export function getValue(message: { content?: string; embed?: MessageEmbed }, id: string): string {
//   switch (id) {
//     case 'content':
//       return message.content;
//     case 'author':
//       return message.embed.author?.name;
//     case 'footer':
//       return message.embed.footer?.text;
//     case 'color':
//       return message.embed.hexColor;
//     case 'image':
//       return message.embed.image?.url;
//     case 'thumbnail':
//       return message.embed.thumbnail?.url;
//     default:
//       return message.embed[id]?.length > 100
//         ? `${message.embed[id].slice(0, 97)}...`
//         : message.embed[id];
//   }
// }

// export function parseCRBTscriptInMessage(
//   message: JoinLeaveMessage,
//   opts: {
//     channel: GuildTextBasedChannel;
//     member: GuildMember;
//   }
// ): JoinLeaveMessage {
//   if (message.content) {
//     message.content = parseCRBTscript(message.content, opts);
//   }

//   if (message.embed) {
//     const raw = Object.entries(message.embed).reduce((acc, [key, value]) => {
//       let newValue: any = value;

//       const [_, __, ___, ____, CRBTscriptSupport] = editableList.find(([id]) => id === key);

//       if (value && CRBTscriptSupport) {
//         if (key === 'timestamp' || key === 'type') return;
//         if (key === 'fields') {
//           newValue = (value as APIEmbedField[]).map((field) => {
//             return {
//               name: parseCRBTscript(field.name, opts),
//               value: parseCRBTscript(field.value, opts),
//               inline: field.inline,
//             };
//           });
//         } else if (key === 'author') {
//           newValue = {
//             name: parseCRBTscript((value as APIEmbedAuthor)?.name, opts),
//           };
//         } else {
//           newValue = parseCRBTscript(value as string, opts);
//         }
//         console.log(value);
//         console.log(newValue);
//         acc = { ...acc, [key]: newValue };
//         console.log(acc);
//       }
//       return acc;
//     }, {} as APIEmbed);

//     console.log(raw);

//     message.embed = raw;
//   }

//   console.log(message);
//   return message;
// }
