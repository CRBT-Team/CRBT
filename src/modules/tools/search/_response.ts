import { getColor } from '$lib/functions/getColor';
import { Interaction, InteractionReplyOptions, InteractionUpdateOptions } from 'discord.js';
import { components } from 'purplet';
import { SearchCmdOpts } from './search';
import { navbar, NavBarProps } from './_navbar';

export async function createSearchResponse(
  i: Interaction,
  opts: SearchCmdOpts,
  baseResponse: InteractionReplyOptions | InteractionUpdateOptions,
  props?: Pick<NavBarProps, 'pages'>
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  return {
    ...baseResponse,
    embeds: await Promise.all(
      baseResponse.embeds.map(async (e) => ({
        ...e,
        color: await getColor(i.user),
      }))
    ),
    components: components(...navbar(opts, { locale: i.locale, ...props })),
    ephemeral: opts.anonymous,
  };
}
