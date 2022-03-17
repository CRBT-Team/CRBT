import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'coinflip',
  description: 'Flip a coin!',
  async handle() {
    const randomValues: [any, number][] = [
      [{ res: 'heads', img: 'https://cdn.clembs.xyz/zBYEdTb.png' }, 45],
      [{ res: 'tails', img: 'https://cdn.clembs.xyz/WsyQVPX.png' }, 45],
      [{ res: 'sideways', img: 'https://cdn.clembs.xyz/Kkeq1eD.png' }, 10],
    ];

    const random = (values: [any, number][]) => {
      const total = values.reduce((acc, [_, value]) => acc + value, 0);
      const randomValue = Math.floor(Math.random() * total);
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        sum += values[i][1];
        if (randomValue < sum) {
          return values[i][0];
        }
      }
      return values[values.length - 1][0];
    };

    const result = random(randomValues);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Landed ${result.res === 'sideways' ? 'on the side' : result.res}!`)
          .setImage(result.img)
          .setColor(await getColor(this.user)),
      ],
    });
  },
});
