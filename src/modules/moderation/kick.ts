import { colors, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { getStrings } from '$lib/language';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'kick',
  description: 'Kick a chosen user from this server.',
  options: new OptionBuilder()
    .user('user', 'The user to kick.', { required: true })
    .string('reason', 'The reason for the kick.'),
  async handle({ user, reason }) {
    const { GUILD_ONLY } = getStrings(this.locale, 'globalErrors');

    if (this.channel.type !== 'DM') {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has('KICK_MEMBERS')) {
      return this.reply(CRBTError('You do not have permission to kick members.'));
    }
    if (!this.guild.me.permissions.has('KICK_MEMBERS')) {
      return this.reply(CRBTError('I do not have permission to kick members.'));
    }
    if (this.user.id === user.id) {
      return this.reply(CRBTError('You cannot kick yourself! (╯°□°）╯︵ ┻━┻'));
    }
    if (!this.guild.members.cache.has(user.id)) {
      return this.reply(CRBTError('The user is not in this server.'));
    }
    const member = this.guild.members.cache.get(user.id);
    if (this.guild.ownerId === user.id) {
      return this.reply(CRBTError('You cannot kick the owner of the server.'));
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return this.reply(CRBTError('You cannot kick a user with a higher role than you.'));
    }
    try {
      await member.kick(reason);

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Successfully kicked ${user.tag}`,
              iconURL: icons.success,
            })
            .setColor(`#${colors.success}`),
        ],
      });

      await user
        .send({
          embeds: [
            createCRBTmsg({
              type: 'moderation',
              user: this.user,
              subject: `Kicked from ${this.guild.name}`,
              message: reason,
              guildName: this.guild.name,
            }).setColor(`#${colors.orange}`),
          ],
        })
        .catch((e) => {});
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }
  },
});
