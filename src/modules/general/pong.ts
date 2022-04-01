import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'pong',
  description: '🏓',
  options: new OptionBuilder()
    .string('hello', 'SAY HELLO', true)
    .string('color', 'WHAT A NICE COLOR', true)
    .string('title', 'MY HAIR IS SO LONG I NEED TO CUT IT OFF', true)
    .boolean('nice', '⚠️ your account may be terminated if you put "false"', true)
    .enum(
      'team',
      'I ATE MY SHOES. NOW MY BREATH SMELLS LIKE FRUIT',
      ['red', 'blue', 'green', 'yellow'].map((c) => ({ name: c.toUpperCase(), value: c })),
      true
    )
    .enum(
      'species',
      'THE TYPE OF SPECIE THAT YOU ARE.',
      ['fish', 'gold fish', 'tropical fish', 'horse', 'red fish', 'fish fish'].map((c) => ({
        name: c.toUpperCase(),
        value: c,
      })),
      true
    )
    .enum('nationality', 'FRENCH', [{ name: 'FRENCH', value: 'french' }], true)
    .enum(
      'controller',
      'THEC TYPER OFI CONTROLLERC TOK USEE LIKET PS4S',
      ['PS4', 'PS3', 'PS2', 'PS1', 'PS0', 'PS-1'].map((c) => ({
        name: c.toUpperCase(),
        value: c,
      })),
      true
    )
    .channel('crbt', 'COGNITIVE RUSSIAN BEHAVIORAL THERAPY. MAKES YOU UNFUNNY', true),
  async handle() {
    this.reply('pong');
  },
});
