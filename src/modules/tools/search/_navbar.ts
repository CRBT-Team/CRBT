import { cache } from '$lib/cache';
import { chunks } from '$lib/functions/chunks';
import { MessageFlags } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';

export const HandleResultButton = ButtonComponent({
  async handle({ query, tabId }: { query: string; tabId: string }) {
    await this.deferUpdate();

    const opts: SearchCmdOpts = {
      query,
      site: tabId,
      anonymous: new MessageFlags(this.message.flags).has(MessageFlags.FLAGS.EPHEMERAL),
    };

    const res =
      cache.get(`${this.message.id}:${tabId}`) ??
      (await searchEngines[tabId].handle.call(this, opts));

    cache.set(`${this.message.id}:${tabId}`, res, 120);

    if (res) await this.editReply(res);
  },
});

export function navbar(opts: SearchCmdOpts, locale: string) {
  const arr = chunks(
    Object.entries(searchEngines).filter(([v, { show }]) => show),
    5
  );

  return arr.map((enginesRow) =>
    row().addComponents(
      enginesRow.map(([tabId, { name, emoji, show }]) =>
        new HandleResultButton({ query: opts.query, tabId })
          .setLabel(name)
          .setEmoji(emoji)
          .setStyle('SECONDARY')
          .setDisabled(opts.site === tabId)
      )
    )
  );

  // return row().addComponents(
  //   Object.entries(searchEngines).map(([tabId, { name, emoji }]) =>
  //     new HandleResultButton({ query: opts.query, tabId })
  //       .setLabel(name)
  //       .setEmoji(emoji)
  //       .setStyle('SECONDARY')
  //       .setDisabled(currentTab === tabId)
  //   )
  // );
}
