import { cache } from '$lib/cache';
import { db, misc } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { MessageContextMenuInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('interactionCreate', async (i) => {
  if (i.isModalSubmit()) return;

  if (!['859369676140314624', misc.CRBTid].includes(i.client.user.id)) return;

  try {
    let value = cache.get(`tlm_${i.user.id}`);
    const fromDB = await db.users.findFirst({
      where: { id: i.user.id },
      select: { telemetry: true },
    });

    if (value === undefined) {
      cache.set(`tlm_${i.user.id}`, fromDB?.telemetry === undefined ? true : fromDB?.telemetry);
      value = fromDB?.telemetry === undefined ? true : fromDB?.telemetry;
    }

    if (value === false) return;
  } catch (e) {
    UnknownError(this, String(e));
  }
  if (i.isCommand()) {
    (i.client.channels.cache.get(misc.channels.telemetry) as TextChannel).send({
      embeds: [
        new MessageEmbed().setDescription(`\`\`\`\n${i}\`\`\``).addField('User ID', i.user.id),
      ],
    });
  } else if (i.isContextMenu()) {
    (i.client.channels.cache.get(misc.channels.telemetry) as TextChannel).send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `\`\`\`\n${i.commandName} ${
              i.isUserContextMenu()
                ? `user:${i.targetUser.id}`
                : `message:${(i as MessageContextMenuInteraction).targetMessage.id}`
            }\`\`\``
          )
          .addField('User ID', i.user.id)
          .addField('Platform', i.channel.type),
      ],
    });
  }
});
