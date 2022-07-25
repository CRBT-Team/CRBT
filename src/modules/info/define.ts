import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

const words = readFileSync('./src/lib/util/words-en-US.txt', 'utf8').split('\n');

export default ChatCommand({
  name: 'define',
  description: 'Look up the definition of a given word on an English dictionary.',
  options: new OptionBuilder().string('word', 'The word to define.', {
    autocomplete({ word }) {
      return words
        .filter((w) => w.toLowerCase() === word || w.toLowerCase().startsWith(word))
        .map((word) => ({
          name: word,
          value: word,
        }));
    },
    required: true,
  }),
  async handle({ word }) {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en_US/${encodeURI(word)}`
      );

      if (!res.ok) {
        return await this.reply(
          CRBTError(
            "I couldn't find this word on the dictionary. Try searching it on Urban Dictionary (/urban)"
          )
        );
      }
      const def = (await res.json())[0];

      const e = new MessageEmbed()
        .setAuthor({
          name: `${def.word} - ${def.meanings.length === 1 ? 'Definition' : 'Definitions'}`,
        })
        .addField('Phonetics', def.phonetic ? def.phonetic : '*None available*', true)
        .setColor(await getColor(this.user))
        .setFooter({ text: 'Powered by Dictionary API' });
      for (const meaning of def.meanings) {
        e.addField(
          `*${meaning.partOfSpeech}*`,
          meaning.definitions[0].definition +
            '\n\n' +
            (meaning.definitions[0].example
              ? `*"${meaning.definitions[0].example.replaceAll(def.word, `**${def.word}**`)}"*` +
                `\n\n`
              : '') +
            (meaning.definitions[0].synonyms.length > 0
              ? `Similar: ${meaning.definitions[0].synonyms
                  .map((s) => `\`${s}\``)
                  .slice(0, 3)
                  .join(',  ')}`
              : '')
        );
      }
      await this.reply({
        embeds: [e],
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
      });
    } catch (e) {
      await this.reply(UnknownError(this, String(e)));
    }
  },
});
