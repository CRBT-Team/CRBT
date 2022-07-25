import { colors, db, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildMember, GuildMemberRoleManager, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'warn',
  description: 'Timeout a chosen user from this server.',
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to timeout.', { required: true })
    .string('reason', 'The reason for the timeout.'),
  async handle({ user, reason }) {
    if (
      !hasPerms(this.memberPermissions, PermissionFlagsBits.ModerateMembers) &&
      !(this.member.roles as GuildMemberRoleManager).cache.find((r) =>
        r.name.toLowerCase().includes('mod')
      )
    ) {
      return this.reply(
        CRBTError(
          'You do not have permission to warn members (Timeout Members permission or Moderator role required).'
        )
      );
    }
    if (this.user.id === user.id) {
      return this.reply(CRBTError('You cannot warn yourself! ┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻'));
    }
    if (!this.guild.members.cache.has(user.id)) {
      return this.reply(CRBTError('The user is not in this server.'));
    }
    const member = this.guild.members.cache.get(user.id);
    if (this.guild.ownerId === user.id) {
      return this.reply(CRBTError('You cannot warn the owner of the server.'));
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return this.reply(CRBTError('You cannot warn a user with a higher role than you.'));
    }

    try {
      await db.moderationStrikes.create({
        data: {
          serverId: this.guild.id,
          moderatorId: this.user.id,
          targetId: user.id,
          createdAt: new Date(),
          reason,
          type: 'WARN',
        },
      });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Successfully warned ${user.tag}`,
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
              subject: `Warned in ${this.guild.name}`,
              message: reason,
              guildName: this.guild.name,
            }).setColor(`#${colors.error}`),
          ],
        })
        .catch((e) => {});
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }
  },
});
