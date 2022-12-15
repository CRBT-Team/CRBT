import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'pick',
  description: t('en-US', 'pick.description'),
  nameLocalizations: getAllLanguages('pick.name', localeLower),
  descriptionLocalizations: getAllLanguages('pick.description'),
  options: new OptionBuilder()
    .string('values', t('en-US', 'pick.options.values.name'), {
      nameLocalizations: getAllLanguages('pick.options.values.name', localeLower),
      descriptionLocalizations: getAllLanguages('pick.options.values.description'),
      required: true,
    })
    .string('comment', t('en-US', 'COMMENT_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('COMMENT'),
      descriptionLocalizations: getAllLanguages('COMMENT_DESCRIPTION'),
    }),
  async handle({ values, comment }) {
    const valuesArray = values.split(',');
    const randomIndex = Math.floor(Math.random() * valuesArray.length);
    const randomValue = valuesArray[randomIndex];

    await this.reply({
      embeds: [
        {
          ...(comment ? { author: { name: `"${comment}"` } } : {}),
          title: t(this, 'PICK_RESULT', {
            value: randomValue.trim(),
            number: valuesArray.length.toLocaleString(this.locale),
          }),
          color: await getColor(this.user),
        },
      ],
    });
  },
});
