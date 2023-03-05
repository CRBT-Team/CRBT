import { t } from '$lib/language';
import dayjs from 'dayjs';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { getReminderSubject, getUserReminders } from '../_helpers';
import { EditReminderModal } from './EditReminderModal';

export const EditReminderButton = ButtonComponent({
  async handle(reminderId: string) {
    const reminders = await getUserReminders(this.user.id);
    const reminder = reminders.find((r) => r.id === reminderId);

    await this.showModal(
      new EditReminderModal(reminderId)
        .setTitle(t(this, 'EDIT'))
        .setComponents(
          row(
            new TextInputComponent()
              .setLabel(t(this, 'SUBJECT'))
              .setValue(getReminderSubject(reminder, this.client))
              .setCustomId('subject')
              .setMaxLength(100)
              .setStyle('PARAGRAPH')
              .setRequired(true)
          ),
          row(
            new TextInputComponent()
              .setLabel(t(this, 'WHEN_TO_SEND'))
              .setValue(dayjs(reminder.expiresAt).format('YYYY-MM-DD HH:mm'))
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
