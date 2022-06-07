// import { colors, icons } from '$lib/db';
// import { CRBTError } from '$lib/functions/CRBTError';
// import { getStrings } from '$lib/language';
// import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
// import { MessageEmbed, TextChannel } from 'discord.js';
// import { ChatCommand, OptionBuilder } from 'purplet';

// export const channels = new Map<string, string>();

// export default ChatCommand({
//   name: 'welcome channel',
//   description: 'Set a channel where to send the welcome message.',
//   options: new OptionBuilder().channel('channel', 'Where to send the welcome message.', {
//     channelTypes: [ChannelType.GuildText],
//   }),
//   async handle({ channel }) {
//     const { GUILD_ONLY } = getStrings(this.locale, 'globalErrors');

//     if (this.channel.type === 'DM') {
//       return this.reply(CRBTError(GUILD_ONLY));
//     }

//     if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
//       return this.reply(CRBTError('You must be an administrator to use this command.'));
//     }
//     if (
//       !(channel as TextChannel)
//         .permissionsFor(this.guild.me)
//         .has([PermissionFlagsBits.SendMessages])
//     ) {
//       return this.reply(CRBTError('I do not have permission to send messages in this channel.'));
//     }

//     await this.deferReply({ ephemeral: true });

//     channels.set(this.guildId, channel.id);

//     await this.editReply({
//       embeds: [
//         new MessageEmbed()
//           .setAuthor({
//             name: 'Welcome channel set!',
//             iconURL: icons.success,
//           })
//           .setDescription(
//             `New members will now be welcomed in ${channel}. To change the message that get sent, you may use the \`/welcome message\` command.`
//           )
//           .setColor(`#${colors.success}`),
//       ],
//     });
//   },
// });
