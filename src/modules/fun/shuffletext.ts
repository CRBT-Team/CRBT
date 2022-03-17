import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'shuffletext',
  description: 'Shuffles the words in a given text.',
  options: new OptionBuilder().string('text', 'The text to shuffle.', true),
  async handle({ text }) {
    const words = text.split(' ');
    const shuffled = [];
    while (words.length) {
      const index = Math.floor(Math.random() * words.length);
      shuffled.push(words.splice(index, 1)[0]);
    }
    this.reply(shuffled.join(' '));
  },
});
