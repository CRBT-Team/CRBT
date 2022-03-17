import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'mc skin',
  description: 'Get a Minecraft skin from a username.',
  options: new OptionBuilder().string(
    'player_name',
    'The username of the player. (Java Edition only)',
    true
  ),
  async handle({ player_name }) {
    try {
      const req = await fetch(`https://api.mojang.com/users/profiles/minecraft/${player_name}`);
      const { id, name }: any = await req.json();

      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${name} - Minecraft info`,
              iconURL: `https://visage.surgeplay.com/face/64/${id}`,
            })
            .setDescription(
              `**[Open in NameMC](https://namemc.com/profile/${name})** | **[Open skin](https://visage.surgeplay.com/skin/${id})**`
            )
            .addField('UUID', id, true)
            .setImage(`https://visage.surgeplay.com/full/512/${id}`)
            .setColor(await getColor(this.user)),
        ],
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});
