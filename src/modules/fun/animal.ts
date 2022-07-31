import { getColor } from '$lib/functions/getColor';
import { ButtonInteraction, Interaction, MessageEmbed } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';

const animalsPath = path.resolve('data/misc/animals');
const animalsDir = fs.readdirSync(animalsPath);

const results: { [k: string]: Results[] } = animalsDir.reduce(
  (acc: { [k: string]: Results[] }, animal: string) => {
    const r = fs.readFileSync(`${animalsPath}/${animal}`, 'utf8');
    const results = JSON.parse(r);
    acc[animal.replace('.json', '')] = results;
    return acc;
  },
  {}
);

interface Results {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

const animals: [string, string[]][] = [
  ['Dog', ['🐶']],
  ['Cat', ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙀', '😿', '😾', '🐱', '🐈', '🐈']],
  ['Panda', ['🐼']],
  ['Fox', ['🦊']],
  ['Bird', ['🐦']],
  ['Koala', ['🐨']],
  ['Otter', ['🦦']],
  ['Fish', ['🐟', '🐠', '🐡']],
  ['Hedgehog', ['🦔']],
  ['Horse', ['🐴']],
];

export default ChatCommand({
  name: 'animal',
  description: 'Get a random animal image and fact.',
  options: new OptionBuilder().string('type', 'The animal to display.', {
    choices: animals.reduce(
      (cur, [name, emojis]) => ({
        ...cur,
        [name.toLowerCase()]: `${typeof emojis === 'string' ? emojis : emojis[0]} ${name}`,
      }),
      {}
    ),
    required: true,
  }),
  async handle({ type }) {
    await this.reply(await renderAnimal.call(this, type));
  },
});

export const Refresh = ButtonComponent({
  async handle(animal: string) {
    this.update(await renderAnimal.call(this, animal));
  },
});

async function renderAnimal(this: Interaction, animal: string) {
  const [_, emojis] = animals.find(([name]) => name.toLowerCase() === animal);
  // const baseUrl = 'https://some-random-api.ml/';

  const result = results[animal].at(Math.floor(Math.random() * results[animal].length));

  const color =
    this instanceof ButtonInteraction ? this.message.embeds[0].color : await getColor(this.user);

  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return {
    embeds: [
      new MessageEmbed()
        .setTitle(`${emoji} Random ${animal}!`)
        .setDescription(
          `**[View on Pixabay](${result.pageURL})**\n**Tags:** ${result.tags
            .split(', ')
            .map((tag) => `\`${tag}\``)
            .join(', ')}`
        )
        .setImage(result.largeImageURL)
        .setColor(color)
        .setFooter({
          text: 'Powered by Pixabay • pixabay.com',
        }),
    ],
    components: components(row(new Refresh(animal).setStyle('SECONDARY').setLabel('Another one!'))),
  };
}
