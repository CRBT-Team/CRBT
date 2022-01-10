import { misc } from '$lib/db';
import { MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('interactionCreate', async (i) => {
  if (i.client.user.id !== misc.CRBTid) return;
  if (i.isCommand()) {
    (i.client.channels.cache.get(misc.channels.telemetry) as TextChannel).send({
      embeds: [
        new MessageEmbed().setDescription(`\`\`\`\n${i}\`\`\``).addField('User ID', i.user.id),
      ],
    });
  }
});
