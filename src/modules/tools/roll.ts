import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { AchievementProgress } from '$lib/responses/Achievements';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';
const math = new Parser();

export default ChatCommand({
  name: 'roll',
  description: 'Roll a dice. Supports RPG dice notation.',
  options: new OptionBuilder()
    .string('dice', "What dice to roll. Use 'd6' for a 6-sided die.", { required: true })
    .string('comment', 'A comment to display to provide additional context.'),
  async handle({ dice, comment }) {
    const diceRegex = /(\d+)?d(\d+)/g;
    const rolls = [];
    let achievement = false;

    const parsedDice = dice.toLowerCase().replaceAll(diceRegex, (_, dice = '1', diceSides) => {
      const randDice = () => Math.floor(Math.random() * diceSides) + 1;

      const diceArr = new Array(parseInt(dice)).fill(null).map(randDice);

      diceArr.forEach((roll) => rolls.push(roll));

      if (diceSides === '20' && diceArr.includes(20)) {
        achievement = true;
      }

      return diceArr.join('+');
    });

    if (rolls.length > 100) {
      return CRBTError(this, {
        title: 'You cannot roll more than 100 dice at once.',
        footer: {
          text: 'For space reasons, but also why would you do that lol',
        },
      });
    }

    const result = math.evaluate(parsedDice);

    this.reply({
      embeds: [
        {
          ...(comment ? { author: { name: `"${comment}"` } } : {}),
          title: `Your rolls result to ${result}`,
          footer: {
            text: `Your rolls: ${
              rolls.join(',').length > 2000
                ? `${rolls.join(',').slice(0, 2000)}...`
                : rolls.join(',')
            }`,
          },
          color: await getColor(this.user),
        },
      ],
    });

    if (achievement) {
      AchievementProgress.call(this, 'DND_PRO');
    }
  },
});
