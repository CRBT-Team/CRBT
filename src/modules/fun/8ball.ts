import { colors, illustrations } from '$lib/db';
import { MessageEmbed } from 'discord.js';
import { readFileSync } from 'fs';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: '8ball',
  description: 'Ask a question to 8-Ball.',
  options: new OptionBuilder().string('question', 'A question to ask.', true),
  async handle({ question }) {
    const answers = readFileSync('./src/lib/util/8ball.txt', 'utf8').split('\n');
    const answer = answers[Math.floor(Math.random() * answers.length)].split(' ');

    const answerType = {
      '🟢': colors.green,
      '🟠': colors.orange,
      '🔴': colors.red,
    };

    await this.deferReply();

    setTimeout(async () => {
      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: `8-Ball`, iconURL: illustrations.eightball })
            .addField('Question', question)
            .addField('Answer', answer.slice(1).join(' '))
            .setColor(`#${answerType[answer[0]]}`),
        ],
      });
    }, 500);
  },
});
