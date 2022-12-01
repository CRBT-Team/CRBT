import { cache, fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { extractReminder } from '$lib/functions/extractReminder';
import { getColor } from '$lib/functions/getColor';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { getAllLanguages, t } from '$lib/language';
import { renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import { Reminder } from '@prisma/client';
import { snowflakeToDate, timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import dedent from 'dedent';
import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  MessageButton,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  row,
  SelectMenuComponent,
} from 'purplet';

export default ChatCommand({
  name: 'reminder list',
  description: t('en-US', 'reminder_list.description'),
  descriptionLocalizations: getAllLanguages('reminder_list.description'),
  async handle() {
    dayjs.locale(this.locale);
    const userReminders = (
      await fetchWithCache(`reminders:${this.user.id}`, () =>
        prisma.reminder.findMany({
          where: {
            userId: this.user.id,
          },
        })
      )
    ).sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

    await this.reply({
      ...(await renderList.call(this, userReminders)),
      ephemeral: true,
    });
  },
});

export const ReminderSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const index = parseInt(this.values[0]);
    const userReminders = cache.get<Reminder[]>(`reminders:${this.user.id}`);

    await this.update(await renderReminder.call(this, userReminders, index));
  },
});

export const EditButton = ButtonComponent({
  async handle(index: number) {
    const r = cache.get<Reminder[]>(`reminders:${this.user.id}`)[index];

    await this.showModal(
      new EditModal(index)
        .setTitle('Edit Reminder')
        .setComponents(
          row(
            new TextInputComponent()
              .setLabel(t(this, 'SUBJECT'))
              .setValue(getReminderSubject(r, this.client))
              .setCustomId('subject')
              .setMaxLength(100)
              .setStyle('PARAGRAPH')
              .setRequired(true)
          ),
          row(
            new TextInputComponent()
              .setLabel(t(this, 'WHEN_TO_SEND'))
              .setValue(dayjs(r.expiresAt).format('YYYY-MM-DD HH:mm'))
              .setCustomId('date')
              .setMaxLength(16)
              .setMinLength(16)
              .setStyle('SHORT')
              .setRequired(true)
          )
        )
    );
  },
});

export const EditModal = ModalComponent({
  async handle(index: number) {
    const reminderList = cache.get<Reminder[]>(`reminders:${this.user.id}`);
    const reminder = reminderList[index];
    const subject = this.fields.getTextInputValue('subject');

    try {
      resolveToDate(this.fields.getTextInputValue('date'));
    } catch (e) {
      return CRBTError(this, 'Invalid date format');
    }

    const expiresAt = (await resolveToDate(this.fields.getTextInputValue('date'))).toDate();

    const newTimeout = await prisma.reminder.update({
      where: { id: reminder.id },
      data: { ...reminder, subject, expiresAt },
    });

    reminderList.splice(index, 1, newTimeout);

    cache.set(`reminders:${this.user.id}`, reminderList, 60 * 1000 * 15);

    await this.update(await renderReminder.call(this, reminderList, index));
  },
});

export const BackButton = ButtonComponent({
  async handle() {
    const userReminders = cache.get<Reminder[]>(`reminders:${this.user.id}`);

    return await this.update(await renderList.call(this, userReminders));
  },
});

export const DeleteButton = ButtonComponent({
  async handle(index: number) {
    const embed = this.message.embeds[0];
    await this.update({
      embeds: [
        {
          ...embed,
          author: {
            name: t(this, 'REMINDER_DELETE_CONFIRMATION_TITLE'),
          },
        },
      ],
      components: components(
        row(
          new ConfirmDeleteButton(index).setLabel(t(this, 'YES')).setStyle('DANGER'),
          new BackButton().setLabel(t(this, 'CANCEL')).setStyle('SECONDARY')
        )
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle(index: number) {
    const userReminders = cache.get<Reminder[]>(`reminders:${this.user.id}`);
    const reminder = userReminders[index];

    await prisma.reminder.delete({ where: { id: reminder.id } });

    userReminders.splice(index, 1);

    cache.set(`reminders:${this.user.id}`, userReminders, 60 * 1000 * 15);

    return await this.update(await renderList.call(this, userReminders));
  },
});

export function getReminderSubject(reminder: Reminder, client: Client, isListString = 1) {
  if (reminder.id.endsWith('BIRTHDAY')) {
    const [userId, username] = reminder.subject.split('-');
    const user = client.users.cache.get(userId);
    return t(
      reminder.locale,
      isListString ? 'BIRTHDAY_LIST_CONTENT' : 'BIRTHDAY_REMINDER_MESSAGE'
    ).replace('{USER}', user?.username ?? `${username}`);
  }
  if (reminder.id.includes('MESSAGEREMINDER')) {
    const [username, ...subject] = reminder.subject.split('--');

    return (
      t(reminder.locale, 'REMINDER_MESSAGE_TITLE', {
        user: username,
      }) + (isListString ? `\n${subject.join('--')}` : '')
    );
  }
  return reminder.subject;
}

async function renderReminder(
  this: SelectMenuInteraction | ModalSubmitInteraction,
  userReminders: Reminder[],
  index: number
) {
  const reminder = userReminders[index];
  const { strings } = t(this, 'remind me');

  const data = await extractReminder(reminder, this.client);
  const created = snowflakeToDate(data.messageId);

  return {
    embeds: [
      {
        author: {
          name: `${this.user.tag} - Reminders (${userReminders.length})`,
          icon_url: avatar(this.user, 64),
        },
        title: getReminderSubject(reminder, this.client),
        description: dedent`${timestampMention(data.expiresAt, 'R')}
        ${t(this, 'REMINDER_DESTINATION')} ${
          data.raw.destination === 'dm' ? 'your DMs' : `${data.channel}`
        }
        ${t(this, 'CREATED_ON')} ${timestampMention(created, 'R')} (${timestampMention(
          created,
          'R'
        )})`,
        color: this.message.embeds[0].color,
      },
      ...renderLowBudgetMessage(data),
    ],
    components: components(
      row(
        new ReminderSelectMenu()
          .setPlaceholder(t(this, 'REMINDER_LIST_SELECT_MENU_PLACEHOLDER'))
          .setMaxValues(1)
          .addOptions(
            userReminders.map((r, index) => ({
              label: getReminderSubject(r, this.client),
              description: dayjs(r.expiresAt).fromNow(),
              value: index.toString(),
            }))
          )
      ),
      row(
        new BackButton()
          .setLabel(t(this, 'BACK'))
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('SECONDARY'),
        new EditButton(index)
          .setLabel(t(this, 'EDIT'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY'),
        new DeleteButton(index)
          .setLabel(t(this, 'DELETE'))
          .setEmoji(emojis.buttons.trash_bin)
          .setStyle('DANGER')
      ),
      row(
        data.id.endsWith('BIRTHDAY')
          ? null
          : new MessageButton().setStyle('LINK').setURL(data.url).setLabel(t(this, 'JUMP_TO_MSG')),
        new MessageButton()
          .setStyle('LINK')
          .setLabel(strings.BUTTON_GCALENDAR)
          .setURL(
            `https://calendar.google.com/calendar/render?${new URLSearchParams({
              action: 'TEMPLATE',
              text: getReminderSubject(userReminders[index], this.client),
              dates: `${dayjs(data.expiresAt).format('YYYYMMDD')}/${dayjs(data.expiresAt)
                .add(1, 'day')
                .format('YYYYMMDD')}`,
              details: `${strings.GCALENDAR_EVENT} ${
                data.raw.destination
                  ? strings.GCALENDAR_EVENT_CHANNEL.replace(
                      '{CHANNEL}',
                      `#${data.channel.name}`
                    ).replace('{SERVER}', data.channel.guild.name)
                  : strings.GCALENDAR_EVENT_DM
              }`,
              location: data.url,
            })}`
          )
      )
    ),
  };
}

async function renderList(this: CommandInteraction | ButtonInteraction, userReminders: Reminder[]) {
  return {
    embeds: [
      {
        author: {
          name: t(this, 'REMINDER_LIST_TITLE', {
            user: this.user.tag,
            number: userReminders.length.toLocaleString(this.locale),
          }),
          icon_url: avatar(this.user, 64),
        },
        description: t(
          this,
          userReminders.length === 0 ? 'REMINDER_LIST_NO_REMINDERS' : 'REMINDER_LIST_DESCRIPTION',
          {
            command: slashCmd('reminder new'),
          }
        ),
        fields: userReminders
          .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())
          .map((r) => ({
            name: getReminderSubject(r, this.client),
            value: dedent`${timestampMention(r.expiresAt, 'R')}
            ${t(this, 'REMINDER_DESTINATION')} ${
              r.destination === 'dm' ? t(this, 'IN_YOUR_DMS') : `<#${r.destination}>`
            }`,
          })),
        color:
          this instanceof ButtonInteraction
            ? this.message.embeds[0].color
            : await getColor(this.user),
      },
    ],
    components:
      userReminders.length === 0
        ? []
        : components(
            row(
              new ReminderSelectMenu()
                .setPlaceholder(t(this, 'REMINDER_LIST_SELECT_MENU_PLACEHOLDER'))
                .setMaxValues(1)
                .addOptions(
                  userReminders.map((r, index) => ({
                    label: getReminderSubject(r, this.client),
                    description: `${dayjs(r.expiresAt).fromNow()}`,
                    value: index.toString(),
                  }))
                )
            )
          ),
  };
}

// export const DeleteReminderButton = ButtonComponent({ handle() {} });
