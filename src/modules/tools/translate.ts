import { languagesAutocomplete } from '$lib/autocomplete/languagesAutocomplete';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import googleTranslateApi from '@vitalets/google-translate-api';
import { upperCaseFirst } from 'change-case-all';
import {
  CommandInteraction,
  ContextMenuInteraction,
  MessageComponentInteraction,
} from 'discord.js';
import {
  ChatCommand,
  components,
  MessageContextCommand,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';
import languages from '../../../data/misc/langs.json';
import { useOcrScan } from './Find Text in Image';

console.log(t('fr', 'TRANSLATE'));
// console.log(getAllLanguages('TRANSLATE'));

export default ChatCommand({
  name: 'translate',
  nameLocalizations: getAllLanguages('TRANSLATE'),
  description: 'Translate text to another language.',
  descriptionLocalizations: getAllLanguages('translate.description'),
  options: new OptionBuilder()
    .string('text', t('en-US', 'translate.options.text.description'), {
      nameLocalizations: getAllLanguages('translate.options.text.name', localeLower),
      descriptionLocalizations: getAllLanguages('translate.options.text.description'),
      required: true,
    })
    .string('target', t('en-US', 'translate.options.target.description'), {
      nameLocalizations: getAllLanguages('translate.options.target.name', localeLower),
      descriptionLocalizations: getAllLanguages('translate.options.target.description'),
      autocomplete({ target }) {
        return languagesAutocomplete.call(this, target);
      },
    })
    .string('source', t('en-US', 'translate.options.source.name'), {
      nameLocalizations: getAllLanguages('translate.options.source.name', localeLower),
      descriptionLocalizations: getAllLanguages('translate.options.source.description'),
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
  name: 'Translate (with scan)',
  async handle(message) {
    const image = message.attachments.size
      ? message.attachments.first().url
      : message.embeds.find((e) => e.image)?.image?.url ??
        message.embeds.find((e) => e.thumbnail)?.thumbnail?.url;

    if (!message.content && !image) {
      return CRBTError(this, {
        title: "This message doesn't have any content or images to translate!",
        description: `Note: CRBT doesn't translate embeds for now. You can translate any text with ${slashCmd(
          'translate'
        )}.`,
      });
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
        const [content, error] = await useOcrScan(image);

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
  const to = opts?.to ?? this.locale.split('-')[0];
  const from = opts?.from ?? 'auto';

  if (!languages.all.find((code) => code === from)) {
    CRBTError(
      this,
      t(this, 'TRANSLATE_ERROR_INVALID_LANGUAGE', {
        language: from,
      })
    );
    return;
  }
  if (!languages.all.find((code) => code === to)) {
    CRBTError(
      this,
      t(this, 'TRANSLATE_ERROR_INVALID_LANGUAGE', {
        language: to,
      })
    );
    return;
  }

  const {
    from: {
      language: { iso: source },
    },
    text: translated,
  } = await googleTranslateApi(text, { to, from });

  const color = await getColor(this.user);
  const intl = new Intl.DisplayNames(this.locale, {
    languageDisplay: 'standard',
    style: 'long',
    type: 'language',
    fallback: 'code',
  });

  return {
    embeds: [
      {
        title: t(this, 'TRANSLATE_RESULT', {
          source: intl.of(source),
          target: intl.of(to),
        }),
        fields: [
          {
            name: upperCaseFirst(intl.of(source)),
            value: text,
          },
          {
            name: upperCaseFirst(intl.of(to)),
            value: translated,
          },
        ],
        color,
      },
    ],
    components: components(
      row(
        new TargetLangSelectMenu(source)
          .setPlaceholder(t(this, 'TRANSLATE_SELECT_MENU_PLACEHOLDER'))
          .setOptions(
            languages.limited.map((code) => {
              return {
                label: upperCaseFirst(intl.of(code)),
                value: code,
                default: code === to,
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
      return CRBTError(this, 'ERROR_ONLY_OG_USER_MAY_USE_BTN');
    }

    await this.update(
      await translate.call(this, sourceText, {
        to: lang,
        from: sourceLang,
      })
    );
  },
});
