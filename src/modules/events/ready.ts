import { db } from '$lib/db';
import { setReminder } from '$lib/functions/setReminder';
import { reminders } from '@prisma/client';
import { ModalSubmitInteraction } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('ready', async (client) => {
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers • crbt.ga`,
    type: 'WATCHING',
  });

  (await db.reminders.findMany()).forEach(async (reminder: reminders) => {
    await setReminder(reminder);
  });

  // const profiles = (await db.profiles.findMany({ select: { name: true } }))
  //   .filter((p) => p.name)
  //   .map((p) => p.name);
  // cache.set('profiles', profiles);
  // console.log(`${profiles.length} profiles cached`);

  client.ws.on('INTERACTION_CREATE', async (data) => {
    if (data.type === 5) {
      client.emit(
        'modalSubmit', //@ts-ignore
        new ModalSubmitInteraction(client, data)
      );
    }
  });
});
