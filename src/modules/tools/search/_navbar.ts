import { cache } from '$lib/cache';
import { emojis } from '$lib/env';
import { chunks } from '$lib/functions/chunks';
import { ButtonInteraction, MessageFlags } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { returnFeaturedItem } from './featured';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';

export interface SearchTabBtnProps {
  query: string;
  site: string;
  page: number;
}

export interface NavBarProps {
  locale: string;
  pages: number;
}

async function handleSearchTabBtn(
  this: ButtonInteraction,
  { query, site, page }: SearchTabBtnProps,
  newPage: number
) {
  await this.deferUpdate();

  const opts: SearchCmdOpts = {
    query,
    site,
    anonymous: new MessageFlags(this.message.flags).has(MessageFlags.FLAGS.EPHEMERAL),
    page: newPage,
  };

  const res =
    cache.get(`${this.message.id}:${site}:${newPage}`) ??
    (await searchEngines[site].handle.call(this, opts));

  cache.set(`${this.message.id}:${site}:${newPage}`, res, 120);

  if (res) await this.editReply(res);
}

export const HandleResultButton = ButtonComponent({
  handle(opts: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, opts, 0);
  },
});

export const PreviousPageButton = ButtonComponent({
  handle(opts: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, opts, opts.page - 1);
  },
});

export const NextPageButton = ButtonComponent({
  handle(opts: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, opts, opts.page + 1);
  },
});

export function navbar(opts: SearchCmdOpts, { locale, pages }: NavBarProps) {
  const featured = returnFeaturedItem(opts);
  const { query, page, site: currentSite } = opts;

  const arr = chunks(
    [
      searchEngines[featured].hide
        ? Object.entries(searchEngines).find(([v]) => v === featured)
        : null,
      ...Object.entries(searchEngines).filter(([v, { hide }]) => !hide),
    ].filter(Boolean),
    5
  );

  console.log(arr);

  const result = [
    searchEngines[currentSite].noPagination
      ? null
      : row(
          new PreviousPageButton({ query, site: currentSite, page })
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('PRIMARY')
            .setDisabled(page - 1 <= 0),
          new NextPageButton({ query, site: currentSite, page })
            .setEmoji(emojis.buttons.right_arrow)
            .setStyle('PRIMARY')
            .setDisabled(page === (pages ?? 1))
        ),
    ...arr.map((enginesRow) =>
      row().addComponents(
        enginesRow.map(([engineSite, { name, emoji }]) =>
          new HandleResultButton({ query, site: engineSite, page })
            .setLabel(name)
            .setEmoji(emoji)
            .setStyle('SECONDARY')
            .setDisabled(engineSite === currentSite)
        )
      )
    ),
  ].filter(Boolean);

  return result;
}
