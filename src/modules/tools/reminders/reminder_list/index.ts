import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { getAllLanguages, t } from '$lib/language';
import { renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import { Reminder, ReminderTypes } from '@prisma/client';
import { formatGuildEventCoverURL, snowflakeToDate, timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import dedent from 'dedent';
import { Interaction, MessageButton } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';
import {
  EditableReminderTypes,
  extractReminder,
  getReminderSubject,
  getUserReminders,
} from '../_helpers';
import { DeleteReminderButton } from './DeleteReminderButton';
import { EditReminderButton } from './EditReminderButton';
import { ReminderSelectMenu } from './ReminderSelectMenu';

export default ChatCommand({
  name: 'reminder list',
  description: t('en-US', 'reminder_list.description'),
  descriptionLocalizations: getAllLanguages('reminder_list.description'),
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    dayjs.locale(this.locale);

    await this.editReply(await renderList.call(this));
  },
});

export const BackButton = ButtonComponent({
  async handle() {
    await this.update(await renderList.call(this));
  },
});

export async function renderReminder(this: Interaction, reminder: Reminder) {
  const reminders = await getUserReminders(this.user.id);
  const data = await extractReminder(reminder, this.client);
  const created =
    data.messageId || data.event?.id ? snowflakeToDate(data.messageId || data.event?.id) : null;

  return {
    embeds: [
      {
        author: {
          name: `${formatUsername(this.user)} - ${t(
            this,
            'REMINDERS',
          )} (${reminders.length.toLocaleString(this.locale)})`,
          icon_url: avatar(this.user, 64),
        },
        title: data.event?.name ?? getReminderSubject(reminder, this.client, 0),
        description: dedent`
        ${data.event?.description ?? ''}
        ${
          data.event && data.event.scheduledEndAt
            ? `${timestampMention(data.event.scheduledStartAt)} - ${timestampMention(data.event.scheduledEndAt)}`
            : timestampMention(data.endDate, 'R')
        }
        ${t(this, 'REMINDER_DESTINATION')} ${
          data.raw.destination === 'dm' ? t(this, 'DMS') : `${data.channel}`
        }
        ${t(this, 'CREATED_ON')} ${created ? timestampMention(created, 'D') : '??'} • ${
          created ? timestampMention(created, 'R') : '??'
        }`,
        image:
          data.event && data.event.image
            ? { url: formatGuildEventCoverURL(data.event.id, data.event.image, { size: '512' }) }
            : null,
        color: await getColor(this.user),
      },
      ...renderLowBudgetMessage(data, this.locale),
    ],
    components: components(
      row(
        new BackButton().setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        new EditReminderButton(reminder.id)
          .setLabel(t(this, 'EDIT'))
          .setEmoji(emojis.buttons.edit)
          .setStyle('PRIMARY')
          .setDisabled(!EditableReminderTypes.includes(data.type)),
        new DeleteReminderButton(reminder.id)
          .setLabel(t(this, 'DELETE'))
          .setEmoji(emojis.buttons.trash)
          .setStyle('DANGER'),
      ),
      row(
        ...(data.type === ReminderTypes.BIRTHDAY
          ? []
          : [
              new MessageButton()
                .setStyle('LINK')
                .setURL(data.url)
                .setLabel(
                  data.type === ReminderTypes.EVENT
                    ? t(this, 'VIEW_DETAILS')
                    : t(this, 'JUMP_TO_MSG'),
                ),
            ]),
        new MessageButton()
          .setStyle('LINK')
          .setLabel(t(this, 'remind me.strings.BUTTON_GCALENDAR'))
          .setURL(
            `https://calendar.google.com/calendar/render?${new URLSearchParams({
              action: 'TEMPLATE',
              text: getReminderSubject(reminder, this.client),
              dates: `${dayjs(data.endDate).format('YYYYMMDD')}/${dayjs(data.endDate)
                .add(1, 'day')
                .format('YYYYMMDD')}`,
              details: t(this, 'remind me.strings.GCALENDAR_EVENT_DESCRIPTION', {
                destination: reminder.destination
                  ? t(this, 'DMS')
                  : `#${data.channel.name} • ${data.channel.guild.name}`,
              }),
              location: data.url,
            })}`,
          ),
      ),
    ),
  };
}

export async function renderList(this: Interaction) {
  const reminders = await getUserReminders(this.user.id);

  return {
    embeds: [
      {
        author: {
          name: `${formatUsername(this.user)} - ${t(
            this,
            'REMINDERS',
          )} (${reminders.length.toLocaleString(this.locale)})`,
          icon_url: avatar(this.user, 64),
        },
        description: `${!reminders.length ? t(this, 'REMINDER_LIST_NO_REMINDERS') : ''} ${t(
          this,
          'REMINDER_LIST_DESCRIPTION',
          { command: slashCmd('reminder new') },
        )}`,
        fields: reminders.map((r) => ({
          name: getReminderSubject(r, this.client),
          value: dedent`
          ${timestampMention(r.endDate, 'R')}
          ${t(this, 'REMINDER_DESTINATION')} ${
            r.destination === 'dm' ? t(this, 'DMS') : `<#${r.destination}>`
          }`,
        })),
        color: await getColor(this.user),
      },
    ],
    components: !reminders.length
      ? []
      : components(
          row(
            new ReminderSelectMenu()
              .setPlaceholder(t(this, 'REMINDERS'))
              .setMaxValues(1)
              .addOptions(
                reminders.map((r) => ({
                  label: getReminderSubject(r, this.client),
                  description: `${dayjs(r.endDate).fromNow()}`,
                  value: r.id,
                })),
              ),
          ),
        ),
  };
}
