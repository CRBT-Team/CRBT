import { cache, fetchWithCache } from '$lib/cache';
import { getColor } from '$lib/functions/getColor';
import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import { components } from 'purplet';
import { NavBarProps, navbar } from './_navbar';
import { SearchCmdOpts } from './search';

export async function createSearchResponse(
  i: MessageComponentInteraction | CommandInteraction,
  opts: SearchCmdOpts,
  baseResponse: InteractionReplyOptions | InteractionUpdateOptions,
  props: Pick<NavBarProps, 'pages'> = { pages: 1 },
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  const nav = navbar(opts, { userId: i.user.id, locale: i.locale, ...props });

  return {
    ...baseResponse,
    embeds: await Promise.all(
      baseResponse.embeds.map(async (e) => ({
        ...e,
        color: e.color ?? (await getColor(i.user)),
      })),
    ),
    components: baseResponse.components ? components(...baseResponse.components, ...nav) : nav,
    ephemeral: opts.anonymous,
    files: baseResponse.files || [],
  } as InteractionReplyOptions | InteractionUpdateOptions;
}

export async function fetchResults<T>(
  i: { fetchReply: () => Promise<{ id: string }> },
  opts: SearchCmdOpts,
  getResults: () => Promise<T>,
): Promise<T> {
  const messageId = (await i.fetchReply()).id;

  cache.set(`search:${messageId}`, opts);

  return fetchWithCache(`${opts.site}:${opts.query}`, getResults);
}
