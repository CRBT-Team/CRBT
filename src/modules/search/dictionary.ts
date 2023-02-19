import { slashCmd } from '$lib/functions/commandMention';
import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { CommandInteraction, MessageAttachment, MessageComponentInteraction } from 'discord.js';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { SearchCmdOpts } from './search';
import { handleDuckDuckGo } from './web';
import { createSearchResponse, fetchResults } from './_response';

export async function handleDictionary(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  try {
    const res = await fetchResults(this, opts, () =>
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${encodeURI(opts.query)}`)
    );

    if (!res.ok) {
      if (opts.page === -1) {
        return createCRBTError(
          this,
          `I couldn't find this word on the dictionary. Try searching it on Urban Dictionary (${slashCmd(
            'urban'
          )}).`
        );
      } else {
        return handleDuckDuckGo.call(this, opts);
      }
    }
    const def = (await res.json())[0];

    return createSearchResponse(this, opts, {
      embeds: [
        {
          title: `${def.meanings.length === 1 ? 'Definition' : 'Definitions'} for "${def.word}"`,
          fields: [
            { name: 'Phonetics', value: def.phonetic ?? '*None available*', inline: true },
            def.meanings.map((meaning, i) => ({
              name: `**${i + 1}. *${meaning.partOfSpeech}***`,
              value:
                meaning.definitions[0].definition +
                '\n\n' +
                (meaning.definitions[0].example
                  ? `*"${meaning.definitions[0].example.replaceAll(
                      def.word,
                      `**${def.word}**`
                    )}"*` + `\n\n`
                  : '') +
                (meaning.definitions[0].synonyms.length > 0
                  ? `Similar: ${meaning.definitions[0].synonyms
                      .map((s) => `\`${s}\``)
                      .slice(0, 3)
                      .join(',  ')}`
                  : ''),
              inline: false,
            })),
          ],
          footer: {
            text: t(this, 'POWERED_BY', {
              provider: 'Google Dictionary',
            }),
          },
        },
      ],
      files:
        opts.page === -1 && def.phonetics && def.phonetics.length > 0 && def.phonetics[0].audio
          ? [
              new MessageAttachment(
                await fetch(`${def.phonetics[0].audio}`)
                  .then((res) => res.arrayBuffer())
                  .then((buffer) => Buffer.from(buffer)),
                'Pronounciation.mp3'
              ),
            ]
          : null,
    });
  } catch (e) {
    return UnknownError(this, String(e));
  }
}

export const englishDictionary = readFileSync('./src/lib/util/words-en-US.txt', 'utf8').split(
  '\r\n'
);

// export default ChatCommand({
//   name: 'define',
//   description: 'Look up the definition of a given word on an English dictionary.',
//   options: new OptionBuilder().string('word', 'The word to define.', {
//     autocomplete({ word }) {
//       return englishDictionary
//         .filter((w) => w.toLowerCase() === word || w.toLowerCase().startsWith(word))
//         .map((word) => ({
//           name: word,
//           value: word,
//         }));
//     },
//     required: true,
//   }),
//   async handle({ word }) {
//     await this.deferReply();

//     await this.editReply(
//       await handleDictionary.call(this, {
//         anonymous: false,
//         query: word,
//         site: 'dictionary',
//         page: -1,
//         userId: this.user.id,
//       })
//     );
//   },
// });
