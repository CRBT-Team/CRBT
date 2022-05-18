import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import translate from '@vitalets/google-translate-api';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, MessageContextCommand, OptionBuilder } from 'purplet';
import langJSON from '../../../data/misc/langCodes.json';

const langs = Object.entries(langJSON).reduce(
  (cur, [name, code]) => ({
    ...cur,
    [code]: name,
  }),
  {}
);

export default ChatCommand({
  name: 'translate',
  description: 'Translate text to another language.',
  options: new OptionBuilder()
    .string('text', 'The text to translate.', { required: true })
    .string('target', 'The language to translate to. Defaults to your Discord locale.', langs)
    .string('source', 'The source language to translate from.', langs),
  async handle({ text, target, source }) {
    try {
      const from = source ?? 'auto';
      const to = target ?? this.locale.split('-')[0];
      const tr = await translate(text, { to, from });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Translated from ${langJSON[tr.from.language.iso] ?? tr.from.language.iso} to ${
                langJSON[tr.raw[1][1]] ?? tr.raw[1][1]
              }`,
            })
            .addField(langJSON[tr.from.language.iso] ?? tr.from.language.iso, text)
            .addField(langJSON[tr.raw[1][1]] ?? tr.raw[1][1], tr.text)
            .setColor(await getColor(this.user)),
        ],
      });
    } catch (e) {
      await this.reply(UnknownError(this, String(e)));
    }
  },
});

export const ctxCommand = MessageContextCommand({
  name: 'Translate Message',
  async handle(message) {
    if (!message.content) {
      return this.reply(
        CRBTError(
          "This message doesn't have any content!\nNote: CRBT cannot translate embeds for now. Please manually translate the content you want using `/translate`."
        )
      );
    }
    try {
      const tr = await translate(message.content, { to: this.locale.split('-')[0] });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Translated from ${langJSON[tr.from.language.iso] ?? tr.from.language.iso} to ${
                langJSON[tr.raw[1][1]] ?? tr.raw[1][1]
              }`,
            })
            .addField(langJSON[tr.from.language.iso] ?? tr.from.language.iso, message.content)
            .addField(langJSON[tr.raw[1][1]] ?? tr.raw[1][1], tr.text)
            .setColor(await getColor(this.user)),
        ],
        ephemeral: true,
      });
    } catch (e) {
      await this.reply(UnknownError(this, String(e)));
    }
  },
});
