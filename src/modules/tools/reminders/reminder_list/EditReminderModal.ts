import { prisma } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { t } from '$lib/language';
import { Dayjs } from 'dayjs';
import { ModalComponent } from 'purplet';
import { renderReminder } from '.';
import { getUserReminders } from '../_helpers';

export const EditReminderModal = ModalComponent({
  async handle(reminderId: string) {
    let date: Dayjs;

    try {
      date = await resolveToDate(this.fields.getTextInputValue('date'));
    } catch (e) {
      return CRBTError(this, t(this, 'remind me.errors.INVALID_FORMAT'));
    }

    const newReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        subject: this.fields.getTextInputValue('subject'),
        expiresAt: date.toDate(),
      },
    });

    await getUserReminders(this.user.id, true);
    await this.update(await renderReminder.call(this, newReminder));
  },
});
