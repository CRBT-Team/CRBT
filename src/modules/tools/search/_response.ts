import { cache, fetchWithCache } from '$lib/cache';
import { getColor } from '$lib/functions/getColor';
import { Interaction, InteractionReplyOptions, InteractionUpdateOptions } from 'discord.js';
import { components } from 'purplet';
import { SearchCmdOpts } from './search';
import { navbar, NavBarProps } from './_navbar';

export async function createSearchResponse(
  i: Interaction,
  opts: SearchCmdOpts,
  baseResponse: InteractionReplyOptions | InteractionUpdateOptions,
  props: Pick<NavBarProps, 'pages'> = { pages: 1 }
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  const nav = navbar(opts, { locale: i.locale, ...props });

  return {
    ...baseResponse,
    embeds: await Promise.all(
      baseResponse.embeds.map(async (e) => ({
        ...e,
        color: e.color ?? (await getColor(i.user)),
      }))
    ),
    components: baseResponse.components ? components(...baseResponse.components, ...nav) : nav,
    ephemeral: opts.anonymous,
    files: baseResponse.files || [],
  } as InteractionReplyOptions | InteractionUpdateOptions;
}

export async function fetchResults<T>(
  i: { fetchReply: () => Promise<{ id: string }> },
  opts: SearchCmdOpts,
  getResults: () => Promise<T>
): Promise<T> {
  cache.set(`search:${(await i.fetchReply()).id}`, opts);

  return fetchWithCache(`${opts.site}:${opts.query}`, getResults);
}
