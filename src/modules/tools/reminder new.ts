import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { colors, db, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { ms } from '$lib/functions/ms';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import dayjs from 'dayjs';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel, Message, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

const { meta } = t('en-US', 'remind me');

export default ChatCommand({
  name: 'reminder new',
  description: meta.description,
  options: new OptionBuilder()
    .string('when', meta.options[0].description, {
      autocomplete({ when }) {
        return timeAutocomplete.call(this, when, '2y');
      },
      required: true,
    })
    .string('subject', meta.options[1].description, {
      required: true,
      minLength: 1,
      maxLength: 512,
    })
    .channel('destination', meta.options[2].description, {
      channelTypes: [ChannelType.GuildText, ChannelType.GuildNews],
    }),
  async handle({ when, subject, destination }) {
    const { strings, errors } = t(this, 'remind me');

    dayjs.locale(this.locale);

    const now = dayjs();
    let expiration: dayjs.Dayjs;

    try {
      expiration = await resolveToDate(when, this.locale);
    } catch (e) {
      return this.reply(CRBTError(errors.INVALID_FORMAT));
    }

    if (expiration.isAfter(now.add(ms('2y')))) {
      return this.reply(CRBTError(errors.TOO_LONG));
    }

    if (destination) {
      const channel = destination as GuildTextBasedChannel;
      if (!channel) {
        return this.reply(CRBTError(errors.INVALID_CHANNEL_TYPE));
      } else if (!hasPerms(channel.permissionsFor(this.user), PermissionFlagsBits.SendMessages)) {
        return this.reply(CRBTError(errors.USER_MISSING_PERMS));
      } else if (
        !hasPerms(channel.permissionsFor(this.guild.me), PermissionFlagsBits.SendMessages)
      ) {
        return this.reply(CRBTError(errors.BOT_MISSING_PERMS));
      }
    }
    const userReminders = (
      await db.timeouts.findMany({
        where: { type: 'REMINDER' },
      })
    ).filter((r) => (r.data as any).userId === this.user.id);

    if (userReminders.length >= 7) {
      return this.reply(CRBTError(errors.REMINDERS_MAX_LIMIT));
    }

    await this.deferReply();

    const expUnix = expiration.unix();

    const msg = await this.fetchReply();
    const url =
      msg instanceof Message
        ? `${msg.guildId ?? '@me'}/${msg.channelId}/${msg.id}`
        : `${msg.guild_id ?? '@me'}/${msg.channel_id}/${msg.id}`;

    try {
      await dbTimeout({
        id: url,
        type: TimeoutTypes.Reminder,
        expiration: expiration.toDate(),
        data: {
          destination: destination ? destination.id : 'dm',
          userId: this.user.id,
          subject,
          url,
        },
        locale: this.locale,
      });

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.SUCCESS_TITLE,
              iconURL: icons.success,
            })
            .setDescription(
              (destination
                ? strings.SUCCESS_CHANNEL.replace('<CHANNEL>', `${destination}`)
                : strings.SUCCESS_DM) +
                `\n` +
                (expiration.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
                  ? strings.TODAY_AT.replace('<TIME>', `<t:${expUnix}:T> • <t:${expUnix}:R>`)
                  : expiration.format('YYYY-MM-DD') === now.add(1, 'day').format('YYYY-MM-DD')
                  ? strings.TOMORROW_AT.replace('<TIME>', `<t:${expUnix}:T> • <t:${expUnix}:R>`)
                  : `<t:${expUnix}> • <t:${expUnix}:R>.`)
            )
            .addField(strings.SUBJECT, subject)
            .setColor(`#${colors.success}`),
        ],
      });
    } catch (error) {
      await this.editReply(UnknownError(this, String(error)));
    }
  },
});
