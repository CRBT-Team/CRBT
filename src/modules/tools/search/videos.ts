import { UnknownError } from '$lib/functions/CRBTError';
import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import ytsr, { Video } from 'ytsr';
import { SearchCmdOpts } from './search';
import { createSearchResponse } from './_response';

export async function handleVideosSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
): Promise<InteractionReplyOptions | InteractionUpdateOptions> {
  const { query } = opts;

  console.log(opts);

  try {
    const req = await ytsr(query, {
      hl: this.locale.split('-')[0],
      gl: this.locale.split('-')[1],
      safeSearch: this.channel.type === 'GUILD_TEXT' && this.channel.nsfw,
    });

    const res = req.items.filter((i) => i.type === 'video') as Video[];
    const video = res[0];

    return await createSearchResponse(this, opts, {
      content: video.url,
      embeds: [
        {
          author: {
            name: `Video results for "${query}"`,
          },
          image: {
            url: video.bestThumbnail.url,
          },
          footer: {
            text: `Powered by YouTube • ${Math.round(res.length)} Results`,
            icon_url: `https://www.gstatic.com/youtube/img/branding/favicon/favicon_48x48.png`,
          },
        },
      ],
    });
  } catch (e) {
    this.reply(UnknownError(this, e));
  }
}
