import { ChatCommand, OptionBuilder } from 'purplet';
import { MessageEmbed } from 'discord.js';
import { Parser } from 'expr-eval';
import { getColor } from '$lib/functions/getColor';
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

    const parsedDice = dice.replaceAll(diceRegex, (_, dice = '1', diceSides) => {

      const randDice = () => Math.floor(Math.random() * diceSides) + 1;

      const diceArr = new Array(parseInt(dice)).fill(null).map(randDice)

      diceArr.forEach((roll) => rolls.push(roll));

      return diceArr.join('+');
    });

    const result = math.evaluate(parsedDice);

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor(comment ? {
            name: `"${comment}"`
          } : null)
          .setTitle(`Your rolls result to ${result}`)
          .setFooter({
            text: `Your rolls: ${rolls.join(', ')}`
          })
          .setColor(await getColor(this.user))
      ]
    })

    console.log(parsedDice);

  },
});