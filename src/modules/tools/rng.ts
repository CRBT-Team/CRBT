import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'rng',
  description: 'Pick a number at random from a given range.',
  options: new OptionBuilder()
    .number('max', "The range's maximum number, 100 by default.")
    .number('min', "The range's minimum number, 1 by default.")
    .string('comment', t('en-US', 'COMMENT_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('COMMENT', localeLower),
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
