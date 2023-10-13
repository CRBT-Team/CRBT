import { cache } from '$lib/cache';
import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { chunks } from '$lib/functions/chunks';
import { t } from '$lib/language';
import { MessageFlags, Routes } from 'discord-api-types/v10';
import { ButtonInteraction } from 'discord.js';
import { ButtonComponent, components, getRestClient, row } from 'purplet';
import { searchEngines } from './_engines';
import { returnFeaturedItem } from './featured';
import { SearchCmdOpts } from './search';

export interface SearchTabBtnProps {
  site?: string;
  newPage?: number;
  // not used, aside from fixing a duplicating bug on Discord
  shit?: boolean;
}

export interface NavBarProps {
  locale: string;
  userId: string;
  pages: number;
}

async function handleSearchTabBtn(this: ButtonInteraction, newOpts: SearchTabBtnProps) {
  const originalInteraction = this.message.interaction;
  const isEphemeral =
    (this.message.flags.valueOf() & MessageFlags.Ephemeral) === MessageFlags.Ephemeral;
  const fromCache = cache.get<SearchCmdOpts>(`search:${this.message.id}`);

  const isOriginalUser = this.user.id === (fromCache?.userId || originalInteraction.user.id);

  const opts: SearchCmdOpts = {
    ...fromCache,
    anonymous: isEphemeral || !isOriginalUser,
    page: newOpts.newPage,
    site: newOpts.site ?? fromCache.site,
    userId: this.user.id,
  };

  if (isOriginalUser) {
    await this.deferUpdate();
  } else {
    await this.deferReply({ ephemeral: true });
  }

  if (newOpts.site) {
    await this.editReply({
      embeds: [
        {
          title: `${emojis.pending} Loading (this may take a while)...`,
          color: colors.yellow,
        },
      ],
      components: components(
        ...this.message.components.map((r) =>
          row().addComponents(r.components.map((b) => ({ ...b, disabled: true }))),
        ),
      ),
    });
  }

  await this.editReply(await searchEngines[opts.site].handle.call(this, opts));
}

export const ChangeSearchButton = ButtonComponent({
  handle(props: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, props);
  },
});

export const DeleteSearchButton = ButtonComponent({
  async handle(userId: string) {
    if (this.user.id !== userId) {
      return CRBTError(this, t(this, 'ERROR_ONLY_OG_USER_MAY_USE_BTN'));
    }

    getRestClient().delete(Routes.channelMessage(this.channelId, this.message.id));
  },
});

export function navbar(opts: SearchCmdOpts, { locale, pages, userId }: NavBarProps) {
  const { page, site: currentSite } = opts;
  const featured = returnFeaturedItem(opts.query);

  const arr = chunks(
    [
      Object.entries(searchEngines).find(
        ([v, { hide }]) => v === currentSite && v !== featured && hide,
      ),
      searchEngines[featured].hide
        ? Object.entries(searchEngines).find(([v]) => v === featured)
        : null,
      ...Object.entries(searchEngines).filter(([v, { hide }]) => !hide),
    ].filter(Boolean),
    5,
  );

  const result = components(
    ...arr.map((enginesRow) =>
      row().addComponents(
        enginesRow.map(([engineSite, { emoji }]) =>
          new ChangeSearchButton({ site: engineSite, newPage: 1 })
            .setLabel(t(locale, `SEARCH_ENGINES.${engineSite}` as any))
            .setEmoji(emoji)
            .setStyle('SECONDARY')
            .setDisabled(engineSite === currentSite),
        ),
      ),
    ),
    ...(searchEngines[currentSite].noPagination && opts.anonymous
      ? []
      : [
          row().addComponents(
            ...(searchEngines[currentSite].noPagination
              ? []
              : [
                  // First page
                  new ChangeSearchButton({ newPage: 0, shit: true })
                    .setEmoji(emojis.buttons.skip_first)
                    .setStyle('PRIMARY')
                    .setDisabled(page - 1 <= 0),
                  // Previous page
                  new ChangeSearchButton({ newPage: page - 1, shit: false })
                    .setEmoji(emojis.buttons.left_arrow)
                    .setStyle('PRIMARY')
                    .setDisabled(page - 1 <= 0),
                  // Next page
                  new ChangeSearchButton({ newPage: page + 1 })
                    .setEmoji(emojis.buttons.right_arrow)
                    .setStyle('PRIMARY')
                    .setDisabled(page >= pages),
                  // Last page
                  new ChangeSearchButton({ newPage: pages - 1, shit: true })
                    .setEmoji(emojis.buttons.skip_last)
                    .setStyle('PRIMARY')
                    .setDisabled(page >= pages),
                ]),
            ...(opts.anonymous
              ? []
              : [
                  new DeleteSearchButton(userId)
                    .setLabel(searchEngines[currentSite].noPagination ? 'Delete Search' : '')
                    .setEmoji(emojis.buttons.trash_bin)
                    .setStyle('DANGER'),
                ]),
          ),
        ]),
  );

  return result;
}
