import { getColor } from '$lib/functions/getColor';
import { Interaction, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ButtonComponent, ChatCommand, Choice, components, OptionBuilder, row } from 'purplet';

const animals = <const>[
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
    await this.reply(await loadAnimal(type, this));
  },
});

export const Refresh = ButtonComponent({
  async handle(animal: string) {
    this.update(await loadAnimal(animal, this));
  },
});

const loadAnimal = async (animal: string, i: Interaction) => {
  const emojis = animals.find(({ name }) => name.toLowerCase() === animal).emoji;
  const baseUrl = 'https://some-random-api.ml/';

  const img = ((await fetch(baseUrl + 'img/' + animal).then((res) => res.json())) as any).link;
  const fact = ((await fetch(baseUrl + 'facts/' + animal).then((res) => res.json())) as any).fact;
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return {
    embeds: [
      new MessageEmbed()
        .setTitle(`${emoji} Random ${animal}!`)
        .addField('Did you know?', fact)
        .setImage(img)
        .setColor(await getColor(i.user)),
    ],
    components: components(row(new Refresh(animal).setStyle('SECONDARY').setLabel('Another one!'))),
  };
};
