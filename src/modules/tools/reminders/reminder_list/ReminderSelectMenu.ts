import { SelectMenuComponent } from 'purplet';
import { renderReminder } from '.';
import { getUserReminders } from '../_helpers';

export const ReminderSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    await this.deferUpdate();
    const reminderId = this.values[0];
    const reminders = await getUserReminders(this.user.id);
    const reminder = reminders.find((r) => r.id === reminderId);

    await this.editReply(await renderReminder.call(this, reminder));
  },
});
