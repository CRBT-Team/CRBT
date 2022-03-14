import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'npm',
  description: 'Search a package on npm.',
  options: new OptionBuilder().string('package', 'The package package to search.'),
  async handle({ package: pkg }) {
    const req = await fetch(`https://registry.npmjs.org/${pkg}`);
  },
});
