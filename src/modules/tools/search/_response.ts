import { getColor } from '$lib/functions/getColor';
import { Interaction, InteractionReplyOptions, InteractionUpdateOptions } from 'discord.js';
import { components } from 'purplet';
import { SearchCmdOpts } from './search';
import { navbar } from './_navbar';

export async function createSearchResponse(
  i: Interaction,
  opts: SearchCmdOpts,
  baseResponse: InteractionReplyOptions | InteractionUpdateOptions
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  return {
    ...baseResponse,
    embeds: await Promise.all(
      baseResponse.embeds.map(async (e) => ({
        ...e,
        color: await getColor(i.user),
      }))
    ),
    components: components(...navbar(opts, i.locale)),
    ephemeral: opts.anonymous,
  };
}
