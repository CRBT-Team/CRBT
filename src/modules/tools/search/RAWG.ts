import { CommandInteraction, MessageAttachment } from 'discord.js';
import fetch from 'node-fetch';
import { SearchCmdOpts } from './search';

export async function handleRAWG(this: CommandInteraction, opts: SearchCmdOpts) {
  const { query } = opts;

  const url = `https://api.rawg.io/api/games?${new URLSearchParams({
    key: process.env.RAWG_TOKEN!,
    page_size: '1',
    search: query,
  })}`;

  const req = await fetch(url);

  const res: any = await req.json();

  const game = res.results[0];

  this.reply({
    files: [new MessageAttachment(Buffer.from(JSON.stringify(res, null, 2)), 'res.json')],
  });
}
