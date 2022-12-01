import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { getAllLanguages, t } from '$lib/language';
import { AchievementProgress } from '$lib/responses/Achievements';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';
const math = new Parser();

export default ChatCommand({
  name: 'roll',
  description: t('en-US', 'roll.description'),
  nameLocalizations: getAllLanguages('roll.name'),
  descriptionLocalizations: getAllLanguages('roll.description'),
  options: new OptionBuilder()
    .string('dice', "What dice to roll. Use 'd6' for a 6-sided die.", {
      nameLocalizations: getAllLanguages('roll.options.dice.name'),
      descriptionLocalizations: getAllLanguages('roll.options.dice.description'),
      required: true,
    })
    .string('comment', t('en-US', 'COMMENT_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('COMMENT'),
      descriptionLocalizations: getAllLanguages('COMMENT_DESCRIPTION'),
    }),
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
      return CRBTError(this, t(this, 'ROLL_ERROR_TOO_MANY_DICE'));
    }

    const result = math.evaluate(parsedDice);

    this.reply({
      embeds: [
        {
          ...(comment ? { author: { name: `"${comment}"` } } : {}),
          title: t(this, 'ROLL_RESULTS_TITLE', {
            result,
          }),
          footer: {
            text: t(this, 'ROLL_RESULTS_FOOTER', {
              results:
                rolls.join(',').length > 2000
                  ? `${rolls.join(',').slice(0, 2000)}...`
                  : rolls.join(','),
            }),
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
