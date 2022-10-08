import { UnknownError } from "$lib/functions/CRBTError";
import { getColor } from "$lib/functions/getColor";
import { CommandInteraction, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { components } from "purplet";
import ytsr, { Video } from "ytsr";
import { SearchCmdOpts } from "./search";
import { navbar } from "./_navbar";

export async function handleVideosSearch(this: CommandInteraction | MessageComponentInteraction, opts: SearchCmdOpts) {
  const { query } = opts;

  console.log(opts);

  try {
    const req = await ytsr(query, {
      hl: this.locale.split('-')[0],
      gl: this.locale.split('-')[1],
      safeSearch: this.channel.type === 'GUILD_TEXT' && this.channel.nsfw
    });

    const res = req.items.filter((i) => i.type === "video") as Video[];
    const video = res[0];

    console.log(req);

    return {
      content: video.url,
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `Video results for "${query}"`,
          })
          .setFooter({
            text: `Powered by YouTube • ${Math.round(res.length)} Results`,
            iconURL: `https://www.gstatic.com/youtube/img/branding/favicon/favicon_48x48.png`,
          })
          .setColor(await getColor(this.user)),
      ],
      components: components(
        navbar(opts, 'videos', this.locale)
      ),
      ephemeral: opts.anonymous,
    }


  } catch (e) {
    this.reply(UnknownError(this, e));
  }
}