import { languagesAutocomplete } from '$lib/autocomplete/languagesAutocomplete';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { translate as bingTranslate } from 'bing-translate-api';
import { upperCaseFirst } from 'change-case-all';
import {
  CommandInteraction,
  ContextMenuInteraction,
  MessageComponentInteraction,
} from 'discord.js';
import { ocrSpace } from 'ocr-space-api-wrapper';
import {
  ChatCommand,
  MessageContextCommand,
  OptionBuilder,
  SelectMenuComponent,
  components,
  row,
} from 'purplet';
import languages from '../../../static/misc/langs.json';

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
    .string('to', t('en-US', 'translate.options.target.description'), {
      nameLocalizations: getAllLanguages('TO', localeLower),
      descriptionLocalizations: getAllLanguages('translate.options.target.description'),
      autocomplete({ to }) {
        return languagesAutocomplete.call(this, to);
      },
    })
    .string('from', t('en-US', 'translate.options.source.description'), {
      nameLocalizations: getAllLanguages('FROM', localeLower),
      descriptionLocalizations: getAllLanguages('translate.options.source.description'),
      autocomplete({ from }) {
        return languagesAutocomplete.call(this, from);
      },
    }),
  async handle({ text, to, from }) {
    await this.deferReply();
    try {
      const result = await translate.call(this, text, { to, from });

      if (result) await this.editReply(result);
    } catch (e) {
      await this.editReply(UnknownError(this, e));
    }
  },
});

export const ctxCommand = MessageContextCommand({
  name: 'Translate (w/ images)',
  async handle(message) {
    const image = message.attachments.size
      ? message.attachments.first().url
      : message.embeds.find((e) => e.image)?.image?.url ??
        message.embeds.find((e) => e.thumbnail)?.thumbnail?.url;

    const embedsWithText = message.embeds.filter(
      (e) => e.title || e.author?.name || e.footer?.text || e.description || e.fields?.length,
    );

    if (!message.content && !image && !embedsWithText.length) {
      return CRBTError(this, {
        title: t(this, 'TRANSLATE_MESSAGE_NO_CONTENT_TITLE'),
        description: t(this, 'TRANSLATE_MESSAGE_NO_CONTENT_DESCRIPTION', {
          command: slashCmd('translate'),
        }),
      });
    }

    await this.deferReply({
      ephemeral: true,
    });

    const target = this.locale.split('-')[0];

    try {
      if (image) {
        const [content, error] = await useOcrScan(image);

        if (error) {
          return await CRBTError(this, t(this, 'OCR_ERROR_MESSAGE'));
        }

        return this.editReply(await translate.call(this, content));
      }

      const simpleTr = async (text: string) => (await useTranslate(text, { target }))?.[0];

      const translatedEmbeds = embedsWithText.length
        ? await Promise.all(
            embedsWithText.slice(0, 4).map(async (embed) => {
              embed.title = embed.title ? await simpleTr(embed.title) : null;
              embed.description = embed.description ? await simpleTr(embed.description) : null;
              embed.author = embed.author
                ? {
                    ...embed.author,
                    name: await simpleTr(embed.author.name),
                  }
                : null;
              embed.footer = embed.footer
                ? {
                    ...embed.footer,
                    text: await simpleTr(embed.footer.text),
                  }
                : null;
              embed.fields = await Promise.all(
                embed.fields.map(async (f) => ({
                  ...f,
                  name: await simpleTr(f.name),
                  value: await simpleTr(f.value),
                })),
              );

              return embed;
            }),
          )
        : [];

      const intl = new Intl.DisplayNames(this.locale, {
        type: 'language',
        fallback: 'code',
        style: 'long',
        languageDisplay: 'standard',
      });

      const translatedContent = message.content
        ? (await useTranslate(message.content, { target }))[0]
        : null;

      await this.editReply({
        content: translatedContent,
        embeds: [
          {
            title: `\`Auto\` → \`${upperCaseFirst(intl.of(target))}\``,
            color: await getColor(this.user),
          },
          ...translatedEmbeds,
        ],
      });
    } catch (e) {
      this.editReply(UnknownError(this, e));
    }
  },
});

async function translate(
  this: CommandInteraction | ContextMenuInteraction | MessageComponentInteraction,
  text: string,
  opts?: { to?: string; from?: string },
) {
  const intl = new Intl.DisplayNames(this.locale, {
    type: 'language',
    fallback: 'code',
    style: 'long',
    languageDisplay: 'standard',
  });

  const languageNames = languages.all.map((code) => ({
    name: upperCaseFirst(intl.of(code)),
    value: code,
  }));

  const to = languageNames.find(
    ({ name, value }) =>
      name.toLowerCase() === (opts?.to || this.locale.split('-')[0]).toLowerCase() ||
      value.toLowerCase() === (opts?.to || this.locale.split('-')[0]).toLowerCase(),
  )?.value;
  const from = languageNames.find(
    ({ name, value }) =>
      name.toLowerCase() === (opts?.from ?? 'c').toLowerCase() ||
      value.toLowerCase() === (opts?.from ?? 'auto-detect').toLowerCase(),
  )?.value;

  if (!to) {
    CRBTError(
      this,
      t(this, 'TRANSLATE_ERROR_INVALID_LANGUAGE', {
        language: from,
      }),
    );
    return;
  }
  if (!from) {
    CRBTError(
      this,
      t(this, 'TRANSLATE_ERROR_INVALID_LANGUAGE', {
        language: to,
      }),
    );
    return;
  }

  const [translated, source, target] = await useTranslate(text, {
    source: from,
    target: to,
  });

  return {
    embeds: [
      {
        title: `\`${upperCaseFirst(intl.of(source))}\` → \`${upperCaseFirst(intl.of(target))}\``,
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
        color: await getColor(this.user),
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
            }),
          ),
      ),
    ),
  };
}

export const TargetLangSelectMenu = SelectMenuComponent({
  async handle(sourceLang: string) {
    const lang = this.values[0];
    const sourceText = this.message.embeds[0].fields[0].value;

    if (this.user.id !== this.message.interaction.user.id) {
      return CRBTError(this, t(this, 'ERROR_ONLY_OG_USER_MAY_USE_BTN'));
    }

    await this.update(
      await translate.call(this, sourceText, {
        to: lang,
        from: sourceLang,
      }),
    );
  },
});

export async function useTranslate(
  text: string,
  opts?: {
    source?: string;
    target?: string;
  },
) {
  opts.source ??= 'auto-detect';
  opts.target ??= 'en';

  const { translation, language } = await bingTranslate(text, opts.source, opts.target);
  // const {
  //   raw: { src },
  //   text: output,
  // } = await googleTranslate(text, { to: opts.target, from: opts.source });

  return [translation, language.from, language.to];
}

export async function useOcrScan(
  imageUrl: string,
  lang: string = 'eng',
): Promise<[string, boolean]> {
  const req = ocrSpace(imageUrl, {
    apiKey: process.env.OCR_TOKEN,
    OCREngine: '3',
  });

  let error = false;

  if (
    !req ||
    !req.ParsedResults ||
    req.IsErroredOnProcessing ||
    !req.ParsedResults.length ||
    !req.ParsedResults[0].ParsedText ||
    req.ErrorMessage
  ) {
    error = true;
  }

  return [req.ParsedResults[0].ParsedText, error];
}
