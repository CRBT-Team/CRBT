import { CRBTError } from '$lib/functions/CRBTError';
import { getVar } from '$lib/functions/getVar';
import translate from '@vitalets/google-translate-api';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, Choice, OptionBuilder } from 'purplet';
import langJSON from '../../../data/misc/langCodes.json';

const langs: Choice[] = Object.entries(langJSON).map((lang) => {
  return {
    name: lang[1],
    value: lang[0],
  };
});

export default ChatCommand({
  name: 'translate',
  description: 'Translates given text to the specified language.',
  options: new OptionBuilder()
    .string('text', 'The text to translate.', true)
    .enum('target', 'The language to translate to.', langs)
    .enum('source', 'The source language to translate from.', langs),
  async handle({ text, target, source }) {
    try {
      const from = source ?? 'auto';
      const to = target ?? 'en';
      const tr = await translate(text, { to, from });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor(
              `Translated from ${langJSON[tr.from.language.iso]} to ${langJSON[tr.raw[1][1]]}`
            )
            .setFields([
              { name: langJSON[tr.from.language.iso], value: text },
              { name: langJSON[tr.raw[1][1]], value: tr.text },
            ])
            .setColor(`#${await getVar('color', this.user.id)}`),
        ],
      });
    } catch (e) {
      await this.reply(CRBTError(String(e)));
    }
  },
});
