import { slashCmd } from '$lib/functions/commandMention';
import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { CommandInteraction, MessageAttachment, MessageComponentInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { SearchCmdOpts } from './search';

export async function handleDictionary(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en_US/${encodeURI(opts.query)}`
    );

    if (!res.ok) {
      return createCRBTError(
        this,
        `I couldn't find this word on the dictionary. Try searching it on Urban Dictionary (${slashCmd(
          'urban'
        )}).`
      );
    }
    const def = (await res.json())[0];

    // createSearchResponse(this, opts,
    return {
      embeds: [
        {
          author: {
            name: `${def.word} - ${def.meanings.length === 1 ? 'Definition' : 'Definitions'}`,
          },
          fields: [
            { name: 'Phonetics', value: def.phonetic ?? '*None available*', inline: true },
            def.meanings.map((meaning) => ({
              name: `*${meaning.partOfSpeech}*`,
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
          footer: { text: 'Powered by Google Dictionary' },
        },
      ],
      files:
        def.phonetics && def.phonetics.length > 0 && def.phonetics[0].audio
          ? [
              new MessageAttachment(
                await fetch(`${def.phonetics[0].audio}`)
                  .then((res) => res.arrayBuffer())
                  .then((buffer) => Buffer.from(buffer)),
                'Pronounciation.mp3'
              ),
            ]
          : null,
    };
    // );
  } catch (e) {
    return UnknownError(this, String(e));
  }
}
