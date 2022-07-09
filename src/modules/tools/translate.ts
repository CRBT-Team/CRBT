import { languagesAutocomplete } from '$lib/autocomplete/languagesAutocomplete';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import googleTranslateApi from '@vitalets/google-translate-api';
import { CommandInteraction, ContextMenuInteraction, MessageEmbed } from 'discord.js';
import { ChatCommand, MessageContextCommand, OptionBuilder } from 'purplet';
import languages from '../../../data/misc/languages.json';

export default ChatCommand({
  name: 'translate',
  description: 'Translate text to another language.',
  options: new OptionBuilder()
    .string('text', 'The text to translate.', { required: true })
    .string('target', 'The language to translate to. Defaults to your Discord locale.', {
      autocomplete({ target }) {
        return languagesAutocomplete.call(this, target);
      },
    })
    .string('source', 'The source language to translate from.', {
      autocomplete({ source }) {
        return languagesAutocomplete.call(this, source);
      },
    }),
  async handle({ text, target, source }) {
    try {
      await translate.call(this, text, { to: target, from: source });
    } catch (e) {
      await this[this.replied ? 'editReply' : 'reply'](UnknownError(this, e));
    }
  },
});

export const ctxCommand = MessageContextCommand({
  name: 'Translate Message',
  async handle(message) {
    if (!message.content) {
      return this.editReply(
        CRBTError(
          "This message doesn't have any content!\nNote: CRBT cannot translate embeds for now. Please manually translate the content you want using `/translate`."
        )
      );
    }
    try {
      await translate.call(this, message.content);
    } catch (e) {
      await this[this.replied ? 'editReply' : 'reply'](UnknownError(this, e));
    }
  },
});

async function translate(
  this: CommandInteraction | ContextMenuInteraction,
  text: string,
  opts?: { to?: string; from?: string }
) {
  const target = opts?.to ?? this.locale.split('-')[0];
  const from = opts?.from ?? 'auto';

  if (!languages[from]) {
    return this.reply(CRBTError(`"${from}" is not a valid source language.`));
  }
  if (!languages[target]) {
    return this.reply(CRBTError(`"${target}" is not a valid target language.`));
  }

  await this.deferReply({
    ephemeral: this instanceof ContextMenuInteraction,
  });

  const {
    from: {
      language: { iso: source },
    },
    text: translated,
  } = await googleTranslateApi(text, { to: target, from });

  console.log(source, target);

  await this.editReply({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `Translated from ${languages[source]} to ${languages[target]}`,
        })
        .addField(languages[source], text)
        .addField(languages[target], translated)
        .setColor(await getColor(this.user)),
    ],
  });
}
