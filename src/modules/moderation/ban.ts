import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { colors, db, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { isValidTime, ms } from '$lib/functions/ms';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import dayjs from 'dayjs';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  GuildMember,
  MessageEmbed,
  ModalSubmitInteraction,
  TextInputComponent,
  User,
} from 'discord.js';
import { ChatCommand, ModalComponent, OptionBuilder, row, UserContextCommand } from 'purplet';

export default ChatCommand({
  name: 'ban',
  description: 'Ban a chosen user from this server.',
  allowInDMs: false,
  options: new OptionBuilder()
    .user('user', 'The user to ban.', { required: true })
    //TODO add maxLength to those
    .string('reason', 'The reason for the ban.')
    .integer('delete_messages', 'The number of messages to delete.')
    .string('duration', 'Temporarily ban the user for a specified time.', {
      autocomplete({ duration }) {
        return timeAutocomplete.call(this, duration, '5y', '1m');
      },
    }),
  handle: ban,
});

export const banCtxCommand = UserContextCommand({
  name: 'Ban User',
  async handle(user) {
    return this.showModal(
      new BanModal(user.id)
        .setTitle(`Ban ${user.tag}`)
        .setComponents(
          row(
            new TextInputComponent()
              .setCustomId('REASON')
              .setLabel('Reason for ban')
              .setMaxLength(512)
              .setRequired(true)
              .setStyle('PARAGRAPH')
          ),
          row(
            new TextInputComponent()
              .setCustomId('DELETE_MESSAGES')
              .setLabel('Number of messages to delete')
              .setMaxLength(3)
              .setMinLength(1)
              .setValue('0')
              .setRequired(true)
              .setStyle('SHORT')
          )
        )
    );
  },
});

export const BanModal = ModalComponent({
  handle(userId: string) {
    const reason = this.fields.getTextInputValue('REASON');
    const delete_messages = parseInt(this.fields.getTextInputValue('DELETE_MESSAGES'));

    if (isNaN(delete_messages)) {
      return this.reply(CRBTError(`${delete_messages} is not a number!`));
    }
    if (delete_messages < 0 || delete_messages > 100) {
      return this.reply(CRBTError(`${delete_messages} is not between 0 and 100!`));
    }

    ban.call(this, {
      user: this.guild.members.cache.get(userId).user,
      reason,
      delete_messages,
    });
  },
});

async function ban(
  this: CommandInteraction | ModalSubmitInteraction,
  opts: {
    user?: User;
    reason?: string;
    delete_messages?: number;
    duration?: string;
  }
) {
  const { user, reason, delete_messages, duration } = opts;

  if (duration && !isValidTime(duration) && ms(duration) > ms('3y')) {
    return this.reply(CRBTError('Invalid duration or exceeds 3 years'));
  }

  if (!hasPerms(this.memberPermissions, PermissionFlagsBits.BanMembers)) {
    return this.reply(CRBTError('You do not have permission to ban members.'));
  }
  if (!hasPerms(this.appPermissions, PermissionFlagsBits.BanMembers)) {
    return this.reply(CRBTError('I do not have permission to ban members.'));
  }
  if (this.user.id === user.id) {
    return this.reply(CRBTError('You cannot ban yourself! (╯°□°）╯︵ ┻━┻'));
  }
  if (!this.guild.members.cache.has(user.id)) {
    return this.reply(CRBTError('The user is not in this server.'));
  }

  if (this.guild.ownerId === user.id) {
    return this.reply(CRBTError('You cannot ban the owner of the server.'));
  }

  const member = this.guild.members.cache.get(user.id);

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
            expiration: dayjs().add(ms(duration)),
          }).setColor(`#${colors.error}`),
        ],
      })
      .catch((e) => {});
  } catch (e) {
    return this.reply(UnknownError(this, String(e)));
  }
}
