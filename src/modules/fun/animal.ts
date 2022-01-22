import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, Choice, OptionBuilder } from 'purplet';

const animals = [
  {
    name: 'Dog',
    emoji: ['🐶'],
  },
  {
    name: 'Cat',
    emoji: ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙀', '😿', '😾', '🐱', '🐈', '🐈'],
  },
  {
    name: 'Panda',
    emoji: ['🐼'],
  },
  {
    name: 'Fox',
    emoji: ['🦊'],
  },
  {
    name: 'Bird',
    emoji: ['🐦'],
  },
  {
    name: 'Koala',
    emoji: ['🐨'],
  },
];

const choices: Choice[] = animals.map(({ name }) => {
  return { name, value: name.toLowerCase() };
});

export default ChatCommand({
  name: 'animal',
  description: 'Get a random cute animal!',
  options: new OptionBuilder().enum('type', 'Which animal do you want to see?', choices, true),
  async handle({ type }) {
    const emojis = animals.find(({ name }) => name.toLowerCase() === type).emoji;
    const baseUrl = 'https://some-random-api.ml/';

    const img = ((await fetch(baseUrl + 'img/' + type).then((res) => res.json())) as any).link;
    const fact = ((await fetch(baseUrl + 'facts/' + type).then((res) => res.json())) as any).fact;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emoji} Random ${type}!`)
          .addField('Did you know?', fact)
          .setImage(img)
          .setColor(await getColor(this.user)),
      ],
    });
  },
});
