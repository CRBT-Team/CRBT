import { languagesAutocomplete } from '$lib/autocomplete/languagesAutocomplete';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import googleTranslateApi from '@vitalets/google-translate-api';
import {
  CommandInteraction,
  ContextMenuInteraction,
  MessageComponentInteraction,
  MessageEmbed,
} from 'discord.js';
import {
  ChatCommand,
  components,
  MessageContextCommand,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';
import langCodes from '../../../data/misc/langCodes.json';
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
    await this.deferReply();
    try {
      const result = await translate.call(this, text, { to: target, from: source });

      if (result) await this.editReply(result);
    } catch (e) {
      await this.editReply(UnknownError(this, e));
    }
  },
});

export const ctxCommand = MessageContextCommand({
  name: 'Translate with Scan',
  async handle(message) {
    if (!message.content) {
      return this.reply(
        CRBTError(
          `This message doesn't have any content!\nNote: CRBT cannot translate embeds for now. Please manually translate the content you want using ${slashCmd(
            'translate'
          )}.`
        )
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    try {
      const result = await translate.call(this, message.content);

      if (result) await this.editReply(result);
    } catch (e) {
      await this.editReply(UnknownError(this, e));
    }
  },
});

async function translate(
  this: CommandInteraction | ContextMenuInteraction | MessageComponentInteraction,
  text: string,
  opts?: { to?: string; from?: string }
) {
  const target = opts?.to ?? this.locale.split('-')[0];
  const from = opts?.from ?? 'auto';

  if (!languages[from]) {
    this.editReply(CRBTError(`"${from}" is not a valid source language.`));
    return;
  }
  if (!languages[target]) {
    this.editReply(CRBTError(`"${target}" is not a valid target language.`));
    return;
  }

  const {
    from: {
      language: { iso: source },
    },
    text: translated,
  } = await googleTranslateApi(text, { to: target, from });

  const color = await getColor(this.user);

  console.log(color);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `Translated from ${languages[source]} to ${languages[target]}`,
        })
        .addField(languages[source], text)
        .addField(languages[target], translated)
        .setColor(color),
    ],
    components: components(
      row(
        new TargetLangSelectMenu(source)
          .setPlaceholder('Select a target language to translate to.')
          .setOptions(
            Object.entries(langCodes).map(([code, lang]) => {
              return {
                label: lang,
                value: code,
                default: code === target,
              };
            })
          )
      )
    ),
  };
}

export const TargetLangSelectMenu = SelectMenuComponent({
  async handle(sourceLang: string) {
    const lang = this.values[0];
    const sourceText = this.message.embeds[0].fields[0].value;

    if (this.user.id !== this.message.interaction.user.id) {
      return this.reply(CRBTError(t(this, 'user_navbar').errors.NOT_CMD_USER));
    }

    await this.update(
      await translate.call(this, sourceText, {
        to: lang,
        from: sourceLang,
      })
    );
  },
});
