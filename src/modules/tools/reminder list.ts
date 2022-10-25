import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { snowStamp } from '$lib/functions/snowStamp';
import { time } from '$lib/functions/time';
import { t } from '$lib/language';
import { Reminder } from '@prisma/client';
import dayjs from 'dayjs';
import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  MessageButton,
  MessageEmbed,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextChannel,
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
  description: 'Get a list of all of your reminders.',
  async handle() {
    dayjs.locale(this.locale);
    const userReminders =
      (await prisma.reminder.findMany({
        where: {
          userId: this.user.id
        }
      }))
        .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

    cache.set(`reminders:${this.user.id}`, userReminders, 60 * 1000 * 15);

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

    const modal = new EditModal(index)
      .setTitle('Edit Reminder')
      .setComponents(
        row(
          new TextInputComponent()
            .setLabel('Subject')
            .setValue(getReminderSubject(r, this.client))
            .setCustomId('subject')
            .setMaxLength(100)
            .setStyle('PARAGRAPH')
            .setRequired(true)
        ),
        row(
          new TextInputComponent()
            .setLabel('When to send')
            .setValue(dayjs(r.expiresAt).format('YYYY-MM-DD HH:mm'))
            .setCustomId('date')
            .setMaxLength(16)
            .setMinLength(16)
            .setStyle('SHORT')
            .setRequired(true)
        )
      );

    await this.showModal(modal);
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
        new MessageEmbed({ ...embed }).setAuthor({
          name: 'Are you sure you want to delete this reminder?',
        }),
      ],
      components: components(
        row(
          new ConfirmDeleteButton(index).setLabel('Yes').setStyle('DANGER'),
          new BackButton().setLabel('Cancel').setStyle('SECONDARY')
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
    ).replace('<USER>', user?.username ?? `${username}`);
  }
  return reminder.subject;
}

async function renderReminder(
  this: SelectMenuInteraction | ModalSubmitInteraction,
  userReminders: Reminder[],
  index: number
) {
  const { expiresAt, id, destination } = userReminders[index];
  const [guildId, channelId, messageId] = id.split('/');
  const { JUMP_TO_MSG, BACK, EDIT, DELETE } = t(this, 'genericButtons');
  const { strings } = t(this, 'remind me');
  const channel = this.client.channels.cache.get(channelId) as TextChannel;
  const url = `https://discordapp.com/channels/${id}`;

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${this.user.tag} - Reminders (${userReminders.length})`,
          iconURL: avatar(this.user, 64),
        })
        .setTitle(getReminderSubject(userReminders[index], this.client))
        .setDescription(
          `Will be sent ${time(expiresAt, 'R')} in ${destination === 'dm' ? 'your DMs' : `${channel}`
          }\nCreated ${time(snowStamp(messageId), 'R')} (${time(snowStamp(messageId), 'R')})`
        )
        .setColor(this.message.embeds[0].color),
    ],
    components: components(
      row(
        new ReminderSelectMenu()
          .setPlaceholder('Select a reminder to edit or delete.')
          .setMaxValues(1)
          .addOptions(
            userReminders.map((r, index) => ({
              label: getReminderSubject(r, this.client),
              description: `${dayjs(r.expiresAt).fromNow()}`,
              value: index.toString(),
            }))
          )
      ),
      row(
        new BackButton().setLabel(BACK).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        new EditButton(index).setLabel(EDIT).setEmoji(emojis.buttons.pencil).setStyle('PRIMARY'),
        new DeleteButton(index)
          .setLabel(DELETE)
          .setEmoji(emojis.buttons.trash_bin)
          .setStyle('DANGER')
      ),
      row(
        id.endsWith('BIRTHDAY')
          ? null
          : new MessageButton().setStyle('LINK').setURL(url).setLabel(JUMP_TO_MSG),
        new MessageButton()
          .setStyle('LINK')
          .setLabel(strings.BUTTON_GCALENDAR)
          .setURL(
            `https://calendar.google.com/calendar/render?${new URLSearchParams({
              action: 'TEMPLATE',
              text: getReminderSubject(userReminders[index], this.client),
              dates: `${dayjs(expiresAt).format('YYYYMMDD')}/${dayjs(expiresAt)
                .add(1, 'day')
                .format('YYYYMMDD')}`,
              details: `${strings.GCALENDAR_EVENT} ${destination
                ? strings.GCALENDAR_EVENT_CHANNEL.replace(
                  '<CHANNEL>',
                  `#${channel.name}`
                ).replace('<SERVER>', channel.guild.name)
                : strings.GCALENDAR_EVENT_DM
                }`,
              location: url,
            })}`
          )
      )
    ),
  };
}

async function renderList(
  this: CommandInteraction | ButtonInteraction,
  userReminders: Reminder[]
) {
  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${this.user.tag} - Reminders (${userReminders.length})`,
          iconURL: avatar(this.user, 64),
        })
        .setDescription(
          userReminders.length === 0
            ? `Uh oh, you don't have any reminders set. Use ${slashCmd('reminder new')} to set one!`
            : `You can create a new reminder with ${slashCmd('reminder new')}!`
        )
        .setFields(
          userReminders
            .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())
            .map((r) => ({
              name: getReminderSubject(r, this.client),
              value: `<t:${dayjs(r.expiresAt).unix()}:R>\nDestination: ${r.destination === 'dm' ? 'In your DMs' : `<#${r.destination}>`
                }`,
            }))
        )
        .setColor(
          this instanceof ButtonInteraction
            ? this.message.embeds[0].color
            : await getColor(this.user)
        ),
    ],
    components:
      userReminders.length === 0
        ? []
        : components(
          row(
            new ReminderSelectMenu()
              .setPlaceholder('Select a reminder to edit or delete.')
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
