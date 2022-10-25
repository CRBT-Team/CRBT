import { colors, icons } from '$lib/env';
import dedent from 'dedent';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: '8ball',
  description: 'Ask a question to 8-Ball.',
  options: new OptionBuilder().string('question', 'A question to ask.', {
    required: true,
    maxLength: 1024,
  }),
  async handle({ question }) {
    const answers = dedent`🟢 It is certain.
      🟢 It is decidedly so.
      🟢 Without a doubt.
      🟢 Yes definitely.
      🟢 You may rely on it.
      🟢 As I see it, yes.
      🟢 Most likely.
      🟢 Outlook good.
      🟢 Yes.
      🟢 Signs point to yes.
      🟠 Reply hazy, try again.
      🟠 Ask again later.
      🟠 Better not tell you now.
      🟠 Cannot predict now.
      🟠 Concentrate and ask again.
      🔴 Don't count on it.
      🔴 My reply is no.
      🔴 My sources say no.
      🔴 Outlook not so good.
      🔴 Very doubtful.`.split('\n');

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
          {
            author: {
              name: '8-Ball',
              icon_url: icons.eightball,
            },
            fields: [
              {
                name: 'Question',
                value: question,
              },
              {
                name: 'Answer',
                value: answer.slice(1).join(' '),
              },
            ],
            color: answerType[answer[0]],
          },
        ],
      });
    }, 500);
  },
});
