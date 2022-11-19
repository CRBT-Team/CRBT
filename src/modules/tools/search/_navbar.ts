import { cache } from '$lib/cache';
import { colors, emojis } from '$lib/env';
import { chunks } from '$lib/functions/chunks';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { MessageFlags, Routes } from 'discord-api-types/v10';
import { ButtonInteraction } from 'discord.js';
import { ButtonComponent, components, getRestClient, row } from 'purplet';
import { returnFeaturedItem } from './featured';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';

export interface SearchTabBtnProps {
  site: string;
  page?: number;
  pages?: number;
  // not used, aside from fixing a duplicating bug on Discord
  shit?: boolean;
}

export interface NavBarProps {
  locale: string;
  pages: number;
}

async function handleSearchTabBtn(this: ButtonInteraction, newOpts: Partial<SearchCmdOpts>) {
  const { errors } = t(this, 'user_navbar');

  const h = await this.deferUpdate();

  console.log(JSON.stringify(this.message.interaction, null, 2));
  const isOriginalUser = this.user.id === this.message.interaction?.user?.id || true;

  const fromCache = cache.get<SearchCmdOpts>(`search:${this.message.id}`);

  const opts: SearchCmdOpts = {
    anonymous: !isOriginalUser,
    ...fromCache,
    ...newOpts,
  };

  console.log(isOriginalUser, opts);

  if (fromCache?.site !== newOpts.site) {
    await this[!isOriginalUser ? 'reply' : 'editReply']({
      embeds: [
        {
          title: `${emojis.pending} Loading (this may take a while)...`,
          color: colors.yellow,
        },
      ],
      components: components(
        ...this.message.components.map((r) =>
          row().addComponents(r.components.map((b) => ({ ...b, disabled: true })))
        )
      ),
      flags: opts.anonymous ? MessageFlags.Ephemeral : 0,
    });
  }

  cache.set(`search:${this.message.id}`, opts);

  const res = await searchEngines[opts.site].handle.call(this, opts);

  if (res) await this.editReply(res);
}

export const HandleResultButton = ButtonComponent({
  handle({ site }: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, { site, page: 1 });
  },
});

export const PreviousPageButton = ButtonComponent({
  handle({ site, page }: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, { site, page: page - 1 });
  },
});

export const NextPageButton = ButtonComponent({
  handle({ site, page }: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, { site, page: page + 1 });
  },
});

export const LastPageButton = ButtonComponent({
  handle({ site, pages }: SearchTabBtnProps) {
    handleSearchTabBtn.call(this, { site, page: pages });
  },
});

export const DeleteSearchButton = ButtonComponent({
  async handle() {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== this.message.interaction.user.id) {
      return CRBTError(this, errors.NOT_CMD_USER);
    }

    getRestClient().delete(Routes.channelMessage(this.channelId, this.message.id));
  },
});

export function navbar(opts: SearchCmdOpts, { locale, pages }: NavBarProps) {
  const featured = returnFeaturedItem(opts);
  const { page, site: currentSite } = opts;

  const arr = chunks(
    [
      Object.entries(searchEngines).find(
        ([v, { hide }]) => v === currentSite && v !== featured && hide
      ),
      searchEngines[featured].hide
        ? Object.entries(searchEngines).find(([v]) => v === featured)
        : null,
      ...Object.entries(searchEngines).filter(([v, { hide }]) => !hide),
    ].filter(Boolean),
    5
  );

  console.log(arr);

  const result = components(
    ...arr.map((enginesRow) =>
      row().addComponents(
        enginesRow.map(([engineSite, { name, emoji }]) =>
          new HandleResultButton({ site: engineSite })
            .setLabel(name)
            .setEmoji(emoji)
            .setStyle('SECONDARY')
            .setDisabled(engineSite === currentSite)
        )
      )
    ),
    ...(searchEngines[currentSite].noPagination && opts.anonymous
      ? []
      : [
          row().addComponents(
            ...(searchEngines[currentSite].noPagination
              ? []
              : [
                  new HandleResultButton({ site: currentSite, shit: true })
                    .setEmoji(emojis.buttons.skip_first)
                    .setStyle('PRIMARY')
                    .setDisabled(page - 1 <= 0),
                  new PreviousPageButton({ site: currentSite, page })
                    .setEmoji(emojis.buttons.left_arrow)
                    .setStyle('PRIMARY')
                    .setDisabled(page - 1 <= 0),
                  new NextPageButton({ site: currentSite, page })
                    .setEmoji(emojis.buttons.right_arrow)
                    .setStyle('PRIMARY')
                    .setDisabled(page >= pages),
                  new LastPageButton({ site: currentSite, page, pages })
                    .setEmoji(emojis.buttons.skip_last)
                    .setStyle('PRIMARY')
                    .setDisabled(page >= pages),
                ]),
            ...(opts.anonymous
              ? []
              : [
                  new DeleteSearchButton()
                    .setLabel(searchEngines[currentSite].noPagination ? 'Delete Search' : '')
                    .setEmoji(emojis.buttons.trash_bin)
                    .setStyle('DANGER'),
                ])
          ),
        ])
  );

  return result;
}
