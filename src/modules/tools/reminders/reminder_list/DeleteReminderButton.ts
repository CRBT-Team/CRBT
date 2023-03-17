import { prisma } from '$lib/db';
import { t } from '$lib/language';
import { ButtonComponent, components, row } from 'purplet';
import { BackButton, renderList } from '.';
import { getUserReminders } from '../_helpers';

export const DeleteReminderButton = ButtonComponent({
  async handle(reminderId: string) {
    const embed = this.message.embeds[0];
    await this.update({
      embeds: [
        {
          ...embed,
          author: {
            name: t(this, 'DELETE_CONFIRMATION_TITLE'),
          },
        },
      ],
      components: components(
        row(
          new DeleteReminderConfirmButton(reminderId).setLabel(t(this, 'YES')).setStyle('DANGER'),
          new BackButton().setLabel(t(this, 'CANCEL')).setStyle('SECONDARY')
        )
      ),
    });
  },
});

export const DeleteReminderConfirmButton = ButtonComponent({
  async handle(reminderId: string) {
    await prisma.reminder.delete({ where: { id: reminderId } });
    await getUserReminders(this.user.id, true);

    this.update(await renderList.call(this));
  },
});
