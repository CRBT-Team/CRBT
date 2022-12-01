import { getColor } from '$lib/functions/getColor';
import { getAllLanguages, t } from '$lib/language';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'rng',
  description: 'Pick a number at random from the given range.',
  options: new OptionBuilder()
    .number('max', 'The maximum number to pick. Defaults to 100.')
    .number('min', 'The minimum number to pick. Defaults to 1.')
    .string('comment', t('en-US', 'COMMENT_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('COMMENT'),
      descriptionLocalizations: getAllLanguages('COMMENT_DESCRIPTION'),
    }),
  async handle({ min, max, comment }) {
    min ??= 1;
    max ??= 100;

    const num = Math.floor(Math.random() * (max - min + 1)) + min;

    await this.reply({
      embeds: [
        {
          ...(comment ? { author: { name: `"${comment}"` } } : {}),
          title: `${num}`,
          footer: { text: `Random number between ${min} to ${max}` },
          color: await getColor(this.user),
        },
      ],
    });
  },
});
