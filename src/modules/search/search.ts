import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { autocomplete as duckduckAutocomplete } from 'duck-duck-scrape';
import { ChatCommand, OptionBuilder } from 'purplet';
import { returnFeaturedItem } from './featured';
import { searchEngines } from './_engines';

export interface SearchCmdOpts {
  site: string;
  query: string;
  anonymous?: boolean;
  page: number;
  userId: string;
}

function getChoices(lang = 'en-US') {
  return Object.keys(searchEngines).reduce(
    (acc, id) => ({
      ...acc,
      [id]: `${searchEngines[id].emoji} ${t(lang, `SEARCH_ENGINES.${id}` as any)}`,
    }),
    {}
  );
}

export default ChatCommand({
  name: 'search',
  description: t('en-US', 'search.description'),
  nameLocalizations: getAllLanguages('search.name', localeLower),
  descriptionLocalizations: getAllLanguages('search.description'),
  options: new OptionBuilder()
    .string('query', t('en-US', 'search.options.query.name'), {
      nameLocalizations: getAllLanguages('search.options.query.name', localeLower),
      descriptionLocalizations: getAllLanguages('search.options.query.description'),
      required: true,
      async autocomplete({ query }) {
        if (query) {
          const res = await duckduckAutocomplete(query, this.locale);
          return [
            {
              name: query,
              value: query,
            },
            ...res.map((r) => ({
              name: r.phrase,
              value: r.phrase,
            })),
          ];
        } else {
          return [];
        }
      },
    })
    .string('site', t('en-US', 'search.options.site.description'), {
      nameLocalizations: getAllLanguages('search.options.site.name', localeLower),
      descriptionLocalizations: getAllLanguages('search.options.site.description'),
      choices: getChoices(),
      // choiceLocalizations: {
      //   fr: getChoices('fr'),
      // },
      // Object.keys(languages).reduce(
      //   (acc, lang) => ({ ...acc, [lang]: getChoices(lang) }),
      //   {}
      // ),
    })
    .boolean('anonymous', t('en-US', 'search.options.anonymous.description'), {
      nameLocalizations: getAllLanguages('search.options.anonymous.name', localeLower),
      descriptionLocalizations: getAllLanguages('search.options.anonymous.description'),
    }),
  async handle({ query, anonymous, site }) {
    anonymous ??= false;
    site ??= returnFeaturedItem(query);

    await this.deferReply({
      ephemeral: anonymous,
    });

    const opts = {
      page: 1,
      query,
      anonymous,
      site,
      userId: this.user.id,
    };

    const res = await searchEngines[site].handle.call(this, opts);

    await this.editReply(res);
  },
});
