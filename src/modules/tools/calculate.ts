import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';

const math = new Parser();

export default ChatCommand({
  name: 'calculate',
  description: t('en-US', 'calc.meta.description'),
  nameLocalizations: getAllLanguages('calc.meta.name', localeLower),
  descriptionLocalizations: getAllLanguages('calc.meta.description'),
  options: new OptionBuilder().string(
    'expression',
    t('en-US', 'calc.meta.options.0.description' as any),
    {
      nameLocalizations: getAllLanguages('calc.meta.options.0.name' as any, localeLower),
      descriptionLocalizations: getAllLanguages('calc.meta.options.0.description' as any),
      required: true,
    }
  ),
  async handle({ expression }) {
    try {
      const result = math.evaluate(expression);
      await this.reply({
        embeds: [
          {
            author: { name: `${expression} =` },
            title: `${result}`,
            color: await getColor(this.user),
          },
        ],
      });
    } catch (e) {
      await this.reply(UnknownError(this, String(e)));
    }
  },
});
