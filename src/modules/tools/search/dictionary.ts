import { slashCmd } from '$lib/functions/commandMention';
import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { CommandInteraction, MessageAttachment, MessageComponentInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { handleDuckDuckGo } from './DuckDuckGo';
import { SearchCmdOpts } from './search';
import { createSearchResponse } from './_response';

export async function handleDictionary(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en_US/${encodeURI(opts.query)}`
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
