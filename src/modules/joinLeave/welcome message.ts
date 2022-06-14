// import { colors, db, emojis } from '$lib/db';
// import { CRBTError } from '$lib/functions/CRBTError';
// import { t } from '$lib/language';
// import { PermissionFlagsBits } from 'discord-api-types/v10';
// import { GuildMember, GuildTextBasedChannel, MessageEmbed, TextInputComponent } from 'discord.js';
// import {
//   ButtonComponent,
//   ChatCommand,
//   components,
//   ModalComponent,
//   row,
//   SelectMenuComponent,
// } from 'purplet';
// import { colorsMap } from '../settings/color set';
// import {
//   editableList,
//   getValue,
//   JoinLeaveMessage,
//   parseCRBTscriptInMessage,
//   RawServerJoin,
// } from './shared';

// export default ChatCommand({
//   name: 'welcome message',
//   description: 'Create or edit the message to send when a user joins the server',
//   async handle() {
//     const { GUILD_ONLY } = t(this, 'globalErrors');

//     if (!this.guild) {
//       return this.reply(CRBTError(GUILD_ONLY));
//     }

//     if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
//       return this.reply(CRBTError('You must be an administrator to use this command.'));
//     }

//     const data = (await db.servers.findFirst({
//       where: { id: this.guildId },
//       select: { joinMessage: true },
//     })) as RawServerJoin;

//     await this.reply(
//       await render(data?.joinMessage, {
//         channel: this.channel,
//         member: this.member as GuildMember,
//       })
//     );
//   },
// });

// async function render(
//   message: JoinLeaveMessage,
//   opts: {
//     channel: GuildTextBasedChannel;
//     member: GuildMember;
//   }
// ) {
//   message = message || {
//     embed: {
//       title: 'Welcome <user.name> to <server.name>!',
//       description: 'We hope you enjoy your stay!',
//       color: parseInt(colors.default, 16),
//     },
//   };
//   const parsedMessage = parseCRBTscriptInMessage(message, opts);

//   return {
//     ephemeral: true,
//     ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
//     embeds: [new MessageEmbed(parsedMessage.embed)],
//     components: components(
//       row(
//         new FieldSelectMenu().setPlaceholder('Select a field to edit').setOptions(
//           editableList.map(([id, name]) => {
//             return {
//               label: name,
//               value: id,
//               description: getValue(
//                 { content: message.content, embed: new MessageEmbed(message?.embed) },
//                 id
//               ),
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
//     const [id, name, maxLength, markdownSupport] = editableList.find(([id]) => id === fieldName)!;

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
//           embed: new MessageEmbed(this.message.embeds[0]).toJSON(),
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
//     const data = {
//       content: this.message.content,
//       embed: new MessageEmbed(this.message.embeds[0]).toJSON(),
//     };

//     await db.servers.upsert({
//       where: { id: this.guildId },
//       update: { joinMessage: data as any },
//       create: { id: this.guildId, joinMessage: data as any },
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
//     const [id, name, maxLength, markdownSupport] = editableList.find(([id]) => id === 'color')!;

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
//       embed: new MessageEmbed(this.message.embeds[0]).toJSON(),
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
