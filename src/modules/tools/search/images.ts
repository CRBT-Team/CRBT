import { UnknownError } from "$lib/functions/CRBTError";
import { getColor } from "$lib/functions/getColor";
import { CommandInteraction, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { SafeSearchType, searchImages } from "duck-duck-scrape";
import { components } from "purplet";
import { SearchCmdOpts } from "./search";
import { navbar } from "./_navbar";

export async function handleImageSearch(this: CommandInteraction | MessageComponentInteraction, opts: SearchCmdOpts) {
  const { query } = opts;

  console.log(opts);

  try {
    const req = await searchImages(query, {
      locale: this.locale,
      safeSearch:
        this.channel.type === 'GUILD_TEXT' && this.channel.nsfw
          ? SafeSearchType.OFF
          : SafeSearchType.STRICT,
    });

    const res = req.results;
    const image = res[0];

    console.log(res);

    return {
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `Image results for "${query}"`,
          })
          .setTitle(image.title)
          .setURL(image.url)
          .setImage(image.image)
          .setFooter({
            text: `Powered by DuckDuckGo • Showing 3 out of ${res.length} Results (Page 1/${Math.round(res.length / 3)})`,
            iconURL: `https://duckduckgo.com/favicon.png`,
          })
          .setColor(await getColor(this.user)),
      ],
      components: components(
        navbar(opts, 'images', this.locale)
      ),
      ephemeral: opts.anonymous,
    }


  } catch (e) {
    this.reply(UnknownError(this, e));
  }
}