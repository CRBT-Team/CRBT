import { colors, emojis } from '$lib/env';
import { budgetify } from '$lib/functions/budgetify';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { formatUsername } from '$lib/functions/formatUsername';
import { ms } from '$lib/functions/ms';
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

    const locale = this.locale.split('-')[0];

    await import(`dayjs/locale/${locale}.js`);

    const now = dayjs().locale(locale);

    await this.reply({
      embeds: [
        {
          title: `${emojis.pending} ${t(this, 'SET_REMINDER_EMBED_TITLE')}`,
          description: t(this, 'SET_REMINDER_EMBED_DESCRIPTION', {
            command: slashCmd('reminder list'),
          }),
          color: colors.yellow,
        },
      ],
      ephemeral: true,
      components: components(
        row(
          new SelectTimeMenu(message.id).setOptions(
            (
              [
                ['10m', now.add(10, 'm')],
                ['30m', now.add(30, 'm')],
                ['1h', now.add(1, 'h')],
                ['3h', now.add(3, 'h')],
                ['12h', now.add(12, 'h')],
                ['1d', now.add(1, 'd')],
                ['3d', now.add(3, 'd')],
                ['1w', now.add(1, 'w')],
                ['2w', now.add(2, 'w')],
                ['1M', now.add(1, 'M')],
              ] as [string, dayjs.Dayjs][]
            ).map(([value, name]) => ({
              label: name.fromNow(),
              value: value,
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
    const expiresAt = dayjs().add(ms(this.values[0]));

    try {
      const reminder = await dbTimeout(TimeoutTypes.Reminder, {
        userId: this.user.id,
        destination: 'dm',
        expiresAt: expiresAt.toDate(),
        locale: this.locale,
        id: `${url}-${randomBytes(6)}`,
        subject: `${formatUsername(message.author)}--${subject}`,
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
