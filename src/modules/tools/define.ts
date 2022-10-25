import { readFileSync } from 'fs';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleDictionary } from './search/dictionary';

export const englishDictionary = readFileSync('./src/lib/util/words-en-US.txt', 'utf8').split(
  '\r\n'
);

export default ChatCommand({
  name: 'define',
  description: 'Look up the definition of a given word on an English dictionary.',
  options: new OptionBuilder().string('word', 'The word to define.', {
    autocomplete({ word }) {
      return englishDictionary
        .filter((w) => w.toLowerCase() === word || w.toLowerCase().startsWith(word))
        .map((word) => ({
          name: word,
          value: word,
        }));
    },
    required: true,
  }),
  async handle({ word }) {
    await this.deferReply();

    const res = await handleDictionary.call(this, {
      anonymous: false,
      query: word,
      site: 'dictionary',
      page: 1,
    });

    if (res) {
      await this.editReply(res);
    }
  },
});
