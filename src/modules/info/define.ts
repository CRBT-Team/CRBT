import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageAttachment, MessageEmbed } from 'discord.js';
// import [ stream ] from 'node:fs';
// import { pipeline } from 'stream';
// import { promisify } from 'util';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'define',
  description: 'Looks up the definition of a word on Google Dictionary.',
  options: new OptionBuilder().string('word', 'The word to define.', true),
  async handle({ word }) {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`);

    if (res.status === 200) {
      try {
      const def = (await res.json())[0];

      const e = new MessageEmbed()
        .setAuthor({
          name: `${def.word} - ${def.meanings.length === 1 ? 'Definition' : 'Definitions'}`,
        })
        .addField('Phonetics', def.phonetic ? def.phonetic : '*None available*', true)
        .setColor(await getColor(this.user));

      for (const meaning of def.meanings) {
        e.addField(
          `*${meaning.partOfSpeech}*`,
          meaning.definitions[0].definition +
            '\n\n' +
            (meaning.definitions[0].example
              ? `"*${meaning.definitions[0].example.replaceAll(def.word, `**${def.word}**`)}*"` +
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
        files: def.phonetics[0].audio
          ? [
              new MessageAttachment(
                await fetch(`https:${def.phonetics[0].audio}`)
                  .then((res) => res.arrayBuffer())
                  .then((buffer) => Buffer.from(buffer)),
                'Pronounciation.mp3'
              ),
            ]
          : null,
      });
    } catch (e) {
      await this.reply(CRBTError(String(e)));
    }
    } else {
      await this.reply(CRBTError('this aint an english word to me'));
    }
  },
});
