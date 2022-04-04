import { colors, illustrations } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'timeout',
  description: 'Timeout a chosen user from this server.',
  options: new OptionBuilder()
    .user('user', 'The user to timeout.', true)
    .string('reason', 'The reason for the timeout.', true)
    .enum('duration', 'Temporarily timeout the user for a specified time.', [
      { name: '1 hour', value: '1h' },
      { name: '1 day', value: '1d' },
      { name: '1 week', value: '1w' },
      { name: '1 month', value: '1m' },
    ]),
  async handle({ user, reason, duration }) {
    if (!this.memberPermissions.has('MODERATE_MEMBERS')) {
      return this.reply(CRBTError('You do not have permission to timeout members.'));
    }
    if (!this.guild.me.permissions.has('MODERATE_MEMBERS')) {
      return this.reply(CRBTError('I do not have permission to timeout members.'));
    }
    if (this.user.id === user.id) {
      return this.reply(CRBTError('You cannot timeout yourself! (╯°□°）╯︵ ┻━┻'));
    }
    if (!this.guild.members.cache.has(user.id)) {
      return this.reply(CRBTError('The user is not in this server.'));
    }
    const member = this.guild.members.cache.get(user.id);
    if (this.guild.ownerId === user.id) {
      return this.reply(CRBTError('You cannot timeout the owner of the server.'));
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return this.reply(CRBTError('You cannot timeout a user with a higher role than you.'));
    }

    try {
      await member.timeout(ms(duration), reason);

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Successfully timed out ${user.tag}`,
              iconURL: illustrations.success,
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
              subject: `Timed out from ${this.guild.name}`,
              message: reason,
              guildName: this.guild.name,
            }).setColor(`#${colors.yellow}`),
          ],
        })
        .catch((e) => {});
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }
  },
});
