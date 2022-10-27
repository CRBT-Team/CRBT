import { ChatCommand, OptionBuilder } from 'purplet';
import { handleImageSearch } from '../tools/search/images';

// const animalsPath = path.resolve('data/misc/animals');
// const animalsDir = fs.readdirSync(animalsPath);

// const results: { [k: string]: Results[] } = animalsDir.reduce(
//   (acc: { [k: string]: Results[] }, animal: string) => {
//     const r = fs.readFileSync(`${animalsPath}/${animal}`, 'utf8');
//     const results = JSON.parse(r);
//     acc[animal.replace('.json', '')] = results;
//     return acc;
//   },
//   {}
// );

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
  description: 'Search for animal pics on Google Images.',
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
    await this.deferReply();

    await this.editReply(
      await handleImageSearch.call(this, {
        page: 1,
        query: `${type} images`,
        site: 'images',
      })
    );
  },
});

// export const Refresh = ButtonComponent({
//   async handle(animal: string) {
//     this.update(await renderAnimal.call(this, animal));
//   },
// });

// async function renderAnimal(this: Interaction, animal: string) {
//   const [_, emojis] = animals.find(([name]) => name.toLowerCase() === animal);
//   // const baseUrl = 'https://some-random-api.ml/';

//   const result = results[animal].at(Math.floor(Math.random() * results[animal].length));

//   const color =
//     this instanceof ButtonInteraction ? this.message.embeds[0].color : await getColor(this.user);

//   const emoji = emojis[Math.floor(Math.random() * emojis.length)];

//   return {
//     embeds: [
//       new MessageEmbed()
//         .setTitle(`${emoji} Random ${animal}!`)
//         .setDescription(
//           `**[View on Pixabay](${result.pageURL})**\n**Tags:** ${result.tags
//             .split(', ')
//             .map((tag) => `\`${tag}\``)
//             .join(', ')}`
//         )
//         .setImage(result.previewURL)
//         .setColor(color)
//         .setFooter({
//           text: 'Powered by Pixabay • pixabay.com',
//         }),
//     ],
//     components: components(row(new Refresh(animal).setStyle('SECONDARY').setLabel('Another one!'))),
//   };
// }
