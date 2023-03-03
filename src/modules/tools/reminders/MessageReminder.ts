import { colors, emojis } from '$lib/env';
import { budgetify } from '$lib/functions/budgetify';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { ReminderTypes } from '@prisma/client';
import dayjs from 'dayjs';
import { Message } from 'discord.js';
import { randomBytes } from 'node:crypto';
import { components, MessageContextCommand, row, SelectMenuComponent } from 'purplet';
import { renderReminder } from './reminder_list';
import { getUserReminders } from './_helpers';

export const messageCache = new Map<string, Message>();

export default MessageContextCommand({
  name: 'Set Reminder',
  async handle(message) {
    const userReminders = await getUserReminders(this.user.id);

    if (userReminders.length >= 10) {
      return CRBTError(this, t(this, 'remind me.errors.REMINDERS_MAX_LIMIT'));
    }

    messageCache.set(message.id, message);

    await this.reply({
      embeds: [
        {
          title: `${emojis.pending} Choose when to be reminded of this message.`,
          description: `You can edit this later with ${slashCmd('reminder list')}`,
          color: colors.yellow,
        },
      ],
      ephemeral: true,
      components: components(
        row(
          new SelectTimeMenu(message.id).setOptions(
            [
              '10-minutes',
              '30-minutes',
              '1-hour',
              '3-hours',
              '6-hours',
              '12-hours',
              '1-day',
              '3-days',
              '1-week',
            ].map((h) => ({
              label: h.replace('-', ' '),
              value: h,
            }))
          )
        )
      ),
    });
  },
});

export const SelectTimeMenu = SelectMenuComponent({
  async handle(mId: string) {
    await this.deferUpdate();

    const message = messageCache.get(mId);
    const url = message.url.replace(/https:\/\/((canary|ptb)\.)?discord\.com\/channels\//, '');
    const embed = message.embeds.find((e) => e.title || e.description || e.fields[0].name);
    const subject = `${(
      message.content ||
      embed?.title ||
      embed?.description ||
      embed?.fields[0].name ||
      ''
    )?.slice(0, 60)}...`;
    const details = budgetify(message);
    const [length, unit] = this.values[0].split('-');
    const expiresAt = dayjs().add(Number(length), unit);

    try {
      const reminder = await dbTimeout(TimeoutTypes.Reminder, {
        userId: this.user.id,
        destination: 'dm',
        expiresAt: expiresAt.toDate(),
        locale: this.locale,
        id: `${url}-${randomBytes(6)}`,
        subject: `${message.author.tag}--${subject}`,
        details: JSON.stringify(details),
        type: ReminderTypes.MESSAGE,
      });

      await getUserReminders(this.user.id, true);

      await this.editReply({
        content: `${emojis.success} ${t(this, 'remind me.strings.SUCCESS_TITLE', {
          command: slashCmd('reminder list'),
        })}`,
        embeds: (await renderReminder.call(this, reminder)).embeds,
        components: [],
      });
    } catch (error) {
      await this.editReply(UnknownError(this, error));
    }
  },
});
