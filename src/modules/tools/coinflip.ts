import { getColor } from '$lib/functions/getColor';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'coinflip',
  description: 'Flip a coin!',
  async handle() {
    const randomValues: [any, number][] = [
      [{ res: 'heads', img: 'https://i.imgur.com/zBYEdTb.png' }, 45],
      [{ res: 'tails', img: 'https://i.imgur.com/WsyQVPX.png' }, 45],
      [{ res: 'sideways', img: 'https://i.imgur.com/Kkeq1eD.png' }, 10],
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
        {
          title: `Landed ${result.res === 'sideways' ? 'on the side' : result.res}!`,
          image: {
            url: result.img,
          },
          color: await getColor(this.user),
        },
      ],
    });
  },
});
