import { MessageFlags } from "discord.js";
import { ButtonComponent, row } from "purplet";
import { NavBarContext } from "../../info/user/_navbar";
import { handleDuckDuckGo } from "./DuckDuckGo";
import { handleImageSearch } from "./images";
import { SearchCmdOpts } from "./search";
import { handleVideosSearch } from "./videos";

type Tabs = 'featured' | 'web' | 'images' | 'videos' | 'anime';

export const WebResults = ButtonComponent({
  async handle(query: string) {
    const opts: SearchCmdOpts = {
      query,
      anonymous: (new MessageFlags(this.message.flags).has(MessageFlags.FLAGS.EPHEMERAL)),
    }

    const res = await handleDuckDuckGo.call(this, opts);

    if (res) await this.update(res);
  }
});

export const ImageResults = ButtonComponent({
  async handle(query: string) {
    const opts: SearchCmdOpts = {
      query,
      anonymous: (new MessageFlags(this.message.flags).has(MessageFlags.FLAGS.EPHEMERAL)),
    };

    const res = await handleImageSearch.call(this, opts);

    if (res) await this.update(res);
  }
});



export const VideoResults = ButtonComponent({
  async handle(query: string) {
    const opts: SearchCmdOpts = {
      query,
      anonymous: (new MessageFlags(this.message.flags).has(MessageFlags.FLAGS.EPHEMERAL)),
    };

    const res = await handleVideosSearch.call(this, opts);

    if (res) await this.update(res);
  }
});

export function navbar(
  opts: SearchCmdOpts,
  currentTab: Tabs,
  locale: string,
) {
  return row(
    new WebResults(opts.query)
      .setLabel('Web')
      .setEmoji('🔍')
      .setStyle('SECONDARY')
      .setDisabled(currentTab === 'web'),
    new ImageResults(opts.query)
      .setLabel('Images')
      .setEmoji('🖼️')
      .setStyle('SECONDARY')
      .setDisabled(currentTab === 'images'),
    new VideoResults(opts.query)
      .setLabel('Videos')
      .setEmoji('📺')
      .setStyle('SECONDARY')
      .setDisabled(currentTab === 'videos'),
  )
}