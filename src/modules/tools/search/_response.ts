import { cache } from '$lib/cache';
import { getColor } from '$lib/functions/getColor';
import { Interaction, InteractionReplyOptions, InteractionUpdateOptions } from 'discord.js';
import { SearchCmdOpts } from './search';
import { navbar, NavBarProps } from './_navbar';

export async function createSearchResponse(
  i: Interaction,
  opts: SearchCmdOpts,
  baseResponse: InteractionReplyOptions | InteractionUpdateOptions,
  props: Pick<NavBarProps, 'pages'> = { pages: 1 }
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  return {
    ...baseResponse,
    embeds: await Promise.all(
      baseResponse.embeds.map(async (e) => ({
        ...e,
        color: await getColor(i.user),
      }))
    ),
    components: navbar(opts, { locale: i.locale, ...props }),
    ephemeral: opts.anonymous,
    files: baseResponse.files || [],
  };
}

export async function fetchResults<T>(
  opts: SearchCmdOpts,
  getResults: () => Promise<T>
): Promise<T> {
  const result = cache.get<T>(`${opts.site}:${opts.query}`) ?? (await getResults());

  cache.set(`${opts.site}:${opts.query}`, result, 60 * 3);

  return result;
}
