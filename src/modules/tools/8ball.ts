import { colors, emojis, illustrations } from '$lib/db';
import { MessageEmbed } from 'discord.js';
import { readFileSync } from 'fs';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: '8ball',
  description: 'Asks the magic 8 ball a question.',
  options: new OptionBuilder().string('question', 'The question to ask the 8 ball.', true),
  async handle({ question }) {
    const answers = readFileSync('./src/lib/util/8ball.txt', 'utf8').split('\n');
    const answer = answers[Math.floor(Math.random() * answers.length)].split(' ');

    const AnswerType = {
      '🟢': [colors.green, emojis.colors.green],
      '🟠': [colors.orange, emojis.colors.orange],
      '🔴': [colors.red, emojis.colors.red],
    };

    await this.deferReply();

    setTimeout(async () => {
      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor(`8-Ball`, illustrations.eightball)
            .setFields([
              {
                name: 'Question',
                value: question,
              },
              {
                name: 'Answer',
                value: `${AnswerType[answer[0]][1]} ${answer.slice(1).join(' ')}`,
              },
            ])
            .setColor(`#${AnswerType[answer[0]][0]}`),
        ],
      });
    }, 500);
  },
});
