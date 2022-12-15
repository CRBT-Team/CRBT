import { colors, icons } from '$lib/env';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: '8ball',
  description: t('en-US', '8ball.description'),
  nameLocalizations: getAllLanguages('8ball.name', localeLower),
  descriptionLocalizations: getAllLanguages('8ball.description'),
  options: new OptionBuilder().string(
    'question',
    t('en-US', '8ball.options.question.description'),
    {
      nameLocalizations: getAllLanguages('QUESTION', localeLower),
      descriptionLocalizations: getAllLanguages('8ball.options.question.description'),
      required: true,
      maxLength: 1024,
    }
  ),
  async handle({ question }) {
    const answers = [
      ...t(this, '8BALL_ANSWERS_POSITIVE').map((answer) => ({
        answer: answer,
        type: '🟢',
      })),
      ...t(this, '8BALL_ANSWERS_NEUTRAL').map((answer) => ({
        answer: answer,
        type: '🟠',
      })),
      ...t(this, '8BALL_ANSWERS_NEGATIVE').map((answer) => ({
        answer: answer,
        type: '🔴',
      })),
    ];

    const answer = answers[Math.floor(Math.random() * answers.length)];

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
              name: t(this, '8BALL'),
              icon_url: icons.eightball,
            },
            fields: [
              {
                name: t(this, 'QUESTION'),
                value: question,
              },
              {
                name: t(this, 'ANSWER'),
                value: `${answer.type} ${answer.answer}`,
              },
            ],
            color: answerType[answer.type],
          },
        ],
      });
    }, 500);
  },
});
