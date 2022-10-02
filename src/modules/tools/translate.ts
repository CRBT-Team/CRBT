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
import { useOcrScan } from './Find Text in Image';

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
    const image = message.attachments.size
      ? message.attachments.first().url
      : message.embeds.find((e) => e.image)?.image?.url ?? message.embeds.find((e) => e.thumbnail)?.thumbnail?.url;

    if (!message.content && !image) {
      return CRBTError(
        this,
        `This message doesn't have any content or images to translate!\nNote: CRBT doesn't translate embeds for now. You can translate any text with ${slashCmd(
          'translate'
        )}.`
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    try {
      if (message.content) {
        const { content } = message;

        const result = await translate.call(this, content);
        if (result) await this.editReply(result);
      } else if (image) {
        const [content, error] = (await useOcrScan(image));

        if (error)
          await CRBTError(
            this,
            'No text was recognized from this image. Please try again with a different image, and make sure that the text is legible.'
          );

        const result = await translate.call(this, content);
        if (result) await this.editReply(result);
      }
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
    CRBTError(this, `"${from}" is not a valid source language.`);
    return;
  }
  if (!languages[target]) {
    CRBTError(this, `"${target}" is not a valid target language.`);
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
      return CRBTError(this, t(this, 'user_navbar').errors.NOT_CMD_USER);
    }

    await this.update(
      await translate.call(this, sourceText, {
        to: lang,
        from: sourceLang,
      })
    );
  },
});
