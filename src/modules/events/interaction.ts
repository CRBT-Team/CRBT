import { misc } from '$lib/db';
import { MessageContextMenuInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('interactionCreate', async (i) => {
  if (i.client.user.id !== misc.CRBTid ?? i.client.user.id !== '859369676140314624') return;

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
          .addField('User ID', i.user.id),
      ],
    });
  }
});
