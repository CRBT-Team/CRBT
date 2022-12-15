import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { ms } from '$lib/functions/ms';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { getAllLanguages, t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { ReminderTypes } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import dedent from 'dedent';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel, Message } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'reminder new',
  description: t('en-US', 'remind me.meta.description'),
  descriptionLocalizations: getAllLanguages('remind me.meta.description'),
  options: new OptionBuilder()
    .string('when', t('en-US', 'remind me.meta.options.0.description' as any), {
      nameLocalizations: getAllLanguages('remind me.meta.options.0.name' as any),
      descriptionLocalizations: getAllLanguages('remind me.meta.options.0.description' as any),
      autocomplete({ when }) {
        return timeAutocomplete.call(this, when, '2y');
      },
      required: true,
    })
    .string('subject', t('en-US', 'remind me.meta.options.1.description' as any), {
      nameLocalizations: getAllLanguages('remind me.meta.options.1.name' as any),
      descriptionLocalizations: getAllLanguages('remind me.meta.options.1.description' as any),
      required: true,
      minLength: 1,
      maxLength: 512,
    })
    .channel('destination', t('en-US', 'remind me.meta.options.2.description' as any), {
      nameLocalizations: getAllLanguages('remind me.meta.options.2.name' as any),
      descriptionLocalizations: getAllLanguages('remind me.meta.options.2.description' as any),
      channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
    }),
  async handle({ when, subject, destination }) {
    const { errors } = t(this, 'remind me');

    dayjs.locale(this.locale);

    const now = dayjs();
    let expiresAt: dayjs.Dayjs;

    try {
      expiresAt = await resolveToDate(when, this.locale);
    } catch (e) {
      return CRBTError(this, errors.INVALID_FORMAT);
    }

    if (expiresAt.isAfter(now.add(ms('2y1s')))) {
      return CRBTError(this, errors.TOO_LONG);
    }

    if (destination) {
      const channel = destination as GuildTextBasedChannel;
      if (!hasPerms(channel.permissionsFor(this.user), PermissionFlagsBits.SendMessages)) {
        return CRBTError(
          this,
          t(this, 'ERROR_MISSING_PERMISSIONS', {
            PERMISSIONS: 'Send Messages',
          })
        );
      } else if (
        !hasPerms(channel.permissionsFor(this.guild.me), PermissionFlagsBits.SendMessages)
      ) {
        return CRBTError(
          this,
          t(this, 'ERROR_MISSING_PERMISSIONS', {
            PERMISSIONS: 'Send Messages',
          })
        );
      }
    }
    const userReminders = await prisma.reminder.findMany({
      where: { userId: this.user.id },
    });

    if (userReminders.length >= 10) {
      return CRBTError(this, errors.REMINDERS_MAX_LIMIT);
    }

    await this.deferReply();

    const msg = await this.fetchReply();
    const url =
      msg instanceof Message
        ? `${msg.guildId ?? '@me'}/${msg.channelId}/${msg.id}`
        : `${msg.guild_id ?? '@me'}/${msg.channel_id}/${msg.id}`;

    try {
      await dbTimeout(TimeoutTypes.Reminder, {
        id: url,
        expiresAt: expiresAt.toDate(),
        destination: destination ? destination.id : 'dm',
        userId: this.user.id,
        subject,
        locale: this.locale,
        type: ReminderTypes.NORMAL,
        details: null,
      });

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} ${t(this, 'remind me.strings.SUCCESS_TITLE')}`,
            description: dedent`
              ${
                destination
                  ? t(this, 'remind me.strings.SUCCESS_CHANNEL', {
                      CHANNEL: `${destination}`,
                    })
                  : t(this, 'remind me.strings.SUCCESS_DM')
              }
              ${timestampMention(expiresAt)} • ${timestampMention(expiresAt, 'R')}
            `,
            fields: [
              {
                name: t(this, 'SUBJECT'),
                value: subject,
              },
            ],
            color: colors.success,
          },
        ],
      });
    } catch (error) {
      await this.editReply(UnknownError(this, String(error)));
    }
  },
});
