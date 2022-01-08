import { MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';

export default OnEvent('interactionCreate', async (i) => {
  let cmd: string;

  // we check if the interaction is a command
  if (i.isCommand()) {
    // we check if there are any options
    if (i.options.data.length > 0) {
      // console.log(i.options.data);

      // we check if the command is a subcommand
      if (i.options.data[0].type === 'SUB_COMMAND') {
        // we check if the subcommand has any options
        if (!i.options.data[0].options) {
          cmd = `${i.commandName} ${i.options.getSubcommand()}`;
        } else {
          cmd = `${i.commandName} ${i.options.getSubcommand()} ${i.options.data[0].options
            .map((o) => `${o.name}:${o.value}`)
            .join(' ')}`;
        }
      } else {
        cmd = `${i.commandName} ${i.options.data.map((o) => `${o.name}:${o.value}`).join(' ')}`;
      }
    } else {
      cmd = i.commandName;
    }
    (i.client.channels.cache.get('926077264884559913') as TextChannel).send({
      embeds: [
        new MessageEmbed().setDescription(`\`\`\`\n/${cmd}\`\`\``).addField('User ID', i.user.id),
      ],
    });
    // console.log(`/${cmd} called by ${i.user.tag}`);
  }
});
