import { ChatCommand, OptionBuilder } from 'purplet';
import { searchEngines } from '../tools/search/_engines';

export default ChatCommand({
  name: 'urban',
  description: 'Get the definition of a word from Urban Dictionary.',
  options: new OptionBuilder().string('word', 'The word to define.', { required: true }),
  async handle({ word }) {
    await this.deferReply();

    const res = await searchEngines.urban.handle.call(this, {
      anonymous: false,
      query: word,
      site: 'dictionary',
      page: -1,
    });

    if (res) {
      await this.editReply(res);
    }
  },
});
