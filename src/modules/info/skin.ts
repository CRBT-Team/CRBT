import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import fetch from 'node-fetch';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'skin',
  description: "Get a Minecraft: Java Edition player's skin.",
  options: new OptionBuilder().string(
    'player_name',
    'The username of the player. (Java Edition only)',
    { required: true }
  ),
  async handle({ player_name }) {
    try {
      const { id, name } = (await (
        await fetch(`https://api.mojang.com/users/profiles/minecraft/${player_name}`)
      ).json()) as any;

      await this.reply({
        embeds: [
          {
            author: {
              name: `${name} - Minecraft player info`,
              icon_url: `https://visage.surgeplay.com/face/64/${id}`,
            },
            fields: [
              {
                name: 'UUID',
                value: id,
                inline: true,
              },
            ],
            image: {
              url: `https://visage.surgeplay.com/full/512/${id}`,
            },
            color: await getColor(this.user),
          },
        ],
        components: components(
          row(
            {
              style: 'LINK',
              label: 'NameMC profile',
              type: 'BUTTON',
              url: `https://namemc.com/profile/${name}`,
            },
            {
              style: 'LINK',
              label: 'View skin file',
              type: 'BUTTON',
              url: `https://visage.surgeplay.com/skin/${id}`,
            }
          )
        ),
      });
    } catch (error) {
      CRBTError(
        this,
        "Couldn't find this player. Make sure to use a Minecraft: Java Edition username."
      );
    }
  },
});
