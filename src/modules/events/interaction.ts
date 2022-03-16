import { misc } from '$lib/db';
import { MessageContextMenuInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('interactionCreate', async (i) => {
  if (!['859369676140314624', misc.CRBTid].includes(i.client.user.id)) return;

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
