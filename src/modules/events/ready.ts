import { db } from '$lib/db';
import { setReminder } from '$lib/functions/setReminder';
import { Reminder } from '$lib/types/CRBT/Reminder';
import { ModalSubmitInteraction } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: '🇺🇦 • crbt.ga',
  });

  (await db.reminders.findMany()).forEach(async (reminder: Reminder) => {
    await setReminder(reminder);
  });

  client.ws.on('INTERACTION_CREATE', async (data) => {
    if (data.type === 5) {
      client.emit(
        'modalSubmit', //@ts-ignore
        new ModalSubmitInteraction(client, data)
      );
    }
  });
});
