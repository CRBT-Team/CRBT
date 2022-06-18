import { colors, db, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { isValidTime, ms } from '$lib/functions/ms';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import relative from 'dayjs/plugin/relativeTime.js';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

dayjs.extend(relative);

export default ChatCommand({
  name: 'ban',
  description: 'Ban a chosen user from this server.',
  options: new OptionBuilder()
    .user('user', 'The user to ban.', { required: true })
    .string('reason', 'The reason for the ban.')
    .integer('delete_messages', 'The number of messages to delete.')
    .string('duration', 'Temporarily ban the user for a specified time.', {
      async autocomplete({ duration }) {
        if (!isValidTime(duration)) {
          return [
            {
              name: 'Invalid duration',
              value: '',
            },
          ];
        } else {
          const relative = dayjs().add(ms(duration)).fromNow();
          return [
            {
              name: `${relative}`,
              value: duration,
            },
          ];
        }
      },
    }),
  async handle({ user, reason, delete_messages, duration }) {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has('BAN_MEMBERS')) {
      return this.reply(CRBTError('You do not have permission to ban members.'));
    }
    if (!this.guild.me.permissions.has('BAN_MEMBERS')) {
      return this.reply(CRBTError('I do not have permission to ban members.'));
    }
    if (this.user.id === user.id) {
      return this.reply(CRBTError('You cannot ban yourself! (╯°□°）╯︵ ┻━┻'));
    }
    if (!this.guild.members.cache.has(user.id)) {
      return this.reply(CRBTError('The user is not in this server.'));
    }
    const member = this.guild.members.cache.get(user.id);
    if (!member.bannable) {
      return this.reply(CRBTError('You cannot ban this user.'));
    }
    if (this.guild.ownerId === user.id) {
      return this.reply(CRBTError('You cannot ban the owner of the server.'));
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return this.reply(CRBTError('You cannot ban a user with a higher role than you.'));
    }
    if (!isValidTime(duration)) {
      return this.reply(CRBTError('Invalid duration.'));
    }

    try {
      await member.ban({
        days: delete_messages,
        reason,
      });

      await db.moderationStrikes.create({
        data: {
          serverId: this.guild.id,
          moderatorId: this.user.id,
          targetId: user.id,
          createdAt: new Date(),
          expiresAt: duration ? new Date(Date.now() + ms(duration)) : null,
          reason,
          type: duration ? 'BAN' : 'TEMPBAN',
        },
      });

      if (duration) {
        setDbTimeout({
          type: 'TEMPBAN',
          expiration: new Date(Date.now() + ms(duration)),
          id: this.guild.id,
          locale: this.guildLocale,
          data: {
            userId: user.id,
            guildId: this.guild.id,
            reason,
          },
        });
      }

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Successfully banned ${user.tag}`,
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
              subject: `Banned from ${this.guild.name}`,
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
