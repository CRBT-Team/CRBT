// import { emojis } from '$lib/db';
// import { CRBTError } from '$lib/functions/CRBTError';
// import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
// import { getStrings } from '$lib/language';
// import { APIEmbed, PermissionFlagsBits } from 'discord-api-types/v10';
// import { GuildMember, GuildTextBasedChannel, MessageEmbed, TextInputComponent } from 'discord.js';
// import {
//   ButtonComponent,
//   ChatCommand,
//   components,
//   ModalComponent,
//   row,
//   SelectMenuComponent,
// } from 'purplet';
// import { welcomeDb } from '../events/welcome';
// import { colorsMap } from './color set';

// interface WelcomeMessage {
//   content: string;
//   embed: Partial<APIEmbed>;
// }

// export const messages = new Map<string, WelcomeMessage>();

// export const details: [string, string, number, boolean, boolean][] = [
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

// export default ChatCommand({
//   name: 'welcome message',
//   description: 'Create or edit the message to send when a user joins the server',
//   async handle() {
//     const { GUILD_ONLY } = getStrings(this.locale, 'globalErrors');

//     if (this.channel.type === 'DM') {
//       return this.reply(CRBTError(GUILD_ONLY));
//     }

//     if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
//       return this.reply(CRBTError('You must be an administrator to use this command.'));
//     }

//     await this.reply(
//       await render(welcomeDb[this.guildId].welcome_message, {
//         channel: this.channel,
//         member: this.member as GuildMember,
//       })
//     );
//   },
// });

// function getValue(message: { content?: string; embed?: MessageEmbed }, id: string): string {
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

// async function render(
//   message: {
//     embed: Partial<APIEmbed | MessageEmbed>;
//     content: string;
//   },
//   opts: {
//     channel: GuildTextBasedChannel;
//     member: GuildMember;
//   }
// ) {
//   console.log(message);
//   const parsedEmbed = new MessageEmbed(
//     Object.entries(message?.embed).reduce((acc, [key, value]) => {
//       if (value && key !== 'fields' && key !== 'color') {
//         acc[key] = parseCRBTscript(value.toString(), opts);
//         return acc;
//       }
//     }, {} as APIEmbed)
//   );

//   const content = message?.content ?? '';

//   return {
//     ephemeral: true,
//     ...(content ? { content: parseCRBTscript(content, opts) } : {}),
//     embeds: [parsedEmbed],
//     components: components(
//       row(
//         new FieldSelectMenu().setPlaceholder('Select a field to edit').setOptions(
//           details.map(([id, name]) => {
//             return {
//               label: name,
//               value: id,
//               description: getValue({ content, embed: new MessageEmbed(message?.embed) }, id),
//             };
//           })
//         )
//       ),
//       row(new SaveButton().setLabel('Save').setStyle('SUCCESS').setEmoji(emojis.buttons.reply))
//     ),
//   };
// }

// export const FieldSelectMenu = SelectMenuComponent({
//   handle(ctx: null) {
//     const fieldName = this.values[0];
//     const [id, name, maxLength, markdownSupport] = details.find(([id]) => id === fieldName)!;

//     if (fieldName === 'color') {
//       this.update({
//         components: components(
//           row(
//             new ColorPresetSelectMenu().setPlaceholder('Select a color preset').setOptions(
//               colorsMap
//                 .filter((color) => !color.private && color.value !== 'profile')
//                 .map((colorObj) => ({
//                   label: colorObj.fullName,
//                   value: colorObj.value,
//                   emoji: colorObj.emoji,
//                 }))
//             )
//           ),
//           row(
//             new BackButton().setStyle('SECONDARY').setLabel('Back'),
//             new ManualColorEditButton().setStyle('PRIMARY').setLabel('Use HEX code')
//           )
//         ),
//       });
//     } else {
//       const value = getValue(
//         { embed: new MessageEmbed(this.message.embeds[0]), content: this.message.content },
//         fieldName
//       );
//       console.log(fieldName, value);
//       const modal = new EditModal(fieldName).setTitle(`Edit ${name}`).setComponents(
//         row(
//           new TextInputComponent()
//             .setLabel('Value')
//             .setValue(value ?? '')
//             .setCustomId('VALUE')
//             .setStyle(maxLength <= 256 ? 'SHORT' : 'PARAGRAPH')
//             .setMaxLength(maxLength)
//             .setPlaceholder(markdownSupport ? 'Markdown and CRBTscript are supported.' : '')
//         )
//       );

//       this.showModal(modal);
//     }
//   },
// });

// export const BackButton = ButtonComponent({
//   async handle() {
//     this.update(
//       await render(
//         {
//           content: this.message.content,
//           embed: this.message.embeds[0],
//         },
//         {
//           channel: this.channel,
//           member: this.member as GuildMember,
//         }
//       )
//     );
//   },
// });

// export const SaveButton = ButtonComponent({
//   async handle() {
//     messages.set(this.guildId, {
//       content: this.message.content,
//       embed: new MessageEmbed(this.message.embeds[0]).toJSON(),
//     });

//     this.update({
//       content: 'Saved!',
//       embeds: [],
//       components: [],
//     });
//   },
// });

// export const ColorPresetSelectMenu = SelectMenuComponent({
//   async handle(ctx: null) {
//     const value = this.values[0];

//     this.update({
//       embeds: [new MessageEmbed(this.message.embeds[0]).setColor(`#${value}`)],
//     });
//   },
// });

// export const ManualColorEditButton = ButtonComponent({
//   handle() {
//     const [id, name, maxLength, markdownSupport] = details.find(([id]) => id === 'color')!;

//     this.showModal(
//       new EditModal(id).setTitle(`Edit ${name}`).setComponents(
//         row(
//           new TextInputComponent()
//             .setLabel('Value')
//             .setCustomId('VALUE')
//             .setStyle(maxLength > 256 ? 'SHORT' : 'PARAGRAPH')
//             .setMaxLength(maxLength)
//             .setPlaceholder(markdownSupport ? 'Markdown and CRBTscript are supported.' : '')
//         )
//       )
//     );
//   },
// });

// export const EditModal = ModalComponent({
//   async handle(fieldName: string) {
//     const value = this.fields.getTextInputValue('VALUE');

//     const newMsg = {
//       embed: this.message.embeds[0],
//       content: this.message.content,
//     };

//     switch (fieldName) {
//       case 'content':
//         newMsg.content = value;
//         break;
//       case 'author':
//         newMsg.embed.author = { name: value };
//         break;
//       case 'footer':
//         newMsg.embed.footer = { text: value };
//         break;
//       case 'thumbnail' || 'image':
//         if (!value.match(/^https?:\/\/\S+/)) {
//           return this.reply(CRBTError('Invalid URL'));
//         }
//         newMsg.embed[fieldName].url = value;
//         break;
//       case 'color':
//         if (!value.match(/^#?[0-9a-fA-F]{6}$/)) {
//           return this.reply(CRBTError('Invalid color code'));
//         }
//         newMsg.embed.color = parseInt(value.replace('#', ''), 16);
//         break;
//       default:
//         newMsg.embed[fieldName] = value;
//     }

//     this.update(
//       await render(newMsg, {
//         channel: this.channel,
//         member: this.member as GuildMember,
//       })
//     );
//   },
// });
