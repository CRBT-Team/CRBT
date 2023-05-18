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

const queryRegex = new RegExp(`(${Object.keys(searchEngines).join('|')}):(.*)`);

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
          const manualSiteTyped = queryRegex.test(query);
          const site = manualSiteTyped ? query.split(':')[0] : returnFeaturedItem(query);
          query = manualSiteTyped ? query.split(':').slice(1).join(':') : query;

          return [
            ...(site !== 'web'
              ? [
                  {
                    name: `${searchEngines[site].emoji} Search "${query}" on ${searchEngines[site].provider}`,
                    value: `${site}:${query}`,
                  },
                ]
              : [
                  {
                    name: `${searchEngines['web'].emoji} ${query}`,
                    value: `web:${query}`,
                  },
                ]),
            ...(manualSiteTyped
              ? []
              : res.map((r) => ({
                  name: `${searchEngines['web'].emoji} ${r.phrase}`,
                  value: `web:${r.phrase}`,
                }))),
            ...Object.entries(searchEngines)
              .filter(([key, _]) => key !== site && key !== 'web')
              .map(([key, { provider, emoji }]) => ({
                name: `${emoji} Search "${query}" on ${provider}`,
                value: `${key}:${query}`,
              })),
          ];
        } else {
          return [];
        }
      },
    })
    .boolean('anonymous', t('en-US', 'search.options.anonymous.description'), {
      nameLocalizations: getAllLanguages('search.options.anonymous.name', localeLower),
      descriptionLocalizations: getAllLanguages('search.options.anonymous.description'),
    }),
  async handle({ query, anonymous }) {
    anonymous ??= false;
    const site = queryRegex.test(query) ? query.split(':')[0] : returnFeaturedItem(query);
    query = queryRegex.test(query) ? query.split(':').slice(1).join(':') : query;

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
