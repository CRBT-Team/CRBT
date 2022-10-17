import { autocomplete as duckduckAutocomplete } from 'duck-duck-scrape';
import { ChatCommand, OptionBuilder } from 'purplet';
import { searchEngines } from './_engines';

export interface SearchCmdOpts {
  site: keyof typeof searchEngines;
  query: string;
  anonymous?: boolean;
}

const choices = Object.entries(searchEngines).reduce((acc, [id, { name, emoji, show }]) => {
  if (show)
    return {
      ...acc,
      [id]: `${emoji} ${name}`,
    };
}, {});

export default ChatCommand({
  name: 'search',
  description: 'Search for anything in one of the provided search engines.',
  options: new OptionBuilder()
    .string('query', 'What to search for.', {
      required: true,
      async autocomplete({ query }) {
        if (query) {
          const res = await duckduckAutocomplete(query);
          return res.map((r) => ({
            name: r.phrase,
            value: r.phrase,
          }));
        } else {
          return [];
        }
      },
    })
    .string('site', 'What search engine to use for your query.', {
      choices,
    })
    .boolean('anonymous', 'Whether to show the search results as a public message.'),
  async handle(opts) {
    await this.deferReply();

    const searchEngine = opts.site ?? opts.query.split(':').at(1).trim();
    opts.query = opts.query.match(/.*:.*/) ? opts.query.split(':').at(2) : opts.query;

    if (searchEngine && Object.keys(searchEngines).includes(searchEngine)) {
      const res = await searchEngines[opts.site].handle.call(this, opts as SearchCmdOpts);

      return await this.editReply(res);
    }

    opts.site = 'featured';

    return this.editReply(await searchEngines.featured.handle.call(this, opts as SearchCmdOpts));
  },
});
