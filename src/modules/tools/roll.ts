import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';
const math = new Parser();

export default ChatCommand({
  name: 'roll',
  description: t('en-US', 'roll.description'),
  nameLocalizations: getAllLanguages('roll.name', localeLower),
  descriptionLocalizations: getAllLanguages('roll.description'),
  options: new OptionBuilder()
    .string('dice', t('en-US', 'roll.options.dice.name'), {
      nameLocalizations: getAllLanguages('roll.options.dice.name', localeLower),
      descriptionLocalizations: getAllLanguages('roll.options.dice.description'),
      required: true,
    })
    .string('comment', t('en-US', 'COMMENT_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('COMMENT', localeLower),
      descriptionLocalizations: getAllLanguages('COMMENT_DESCRIPTION'),
    }),
  async handle({ dice, comment }) {
    const diceRegex = /(\d+)?d(\d+)/g;
    const rolls = [];

    const parsedDice = dice.toLowerCase().replaceAll(diceRegex, (_, dice = '1', diceSides) => {
      const randDice = () => Math.floor(Math.random() * diceSides) + 1;

      const diceArr = new Array(parseInt(dice)).fill(null).map(randDice);

      diceArr.forEach((roll) => rolls.push(roll));

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
  },
});
