import { getColor } from '$lib/functions/getColor';
import { CommandInteraction, MessageAttachment, MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import fetch, { Headers } from 'node-fetch';
import { components, row } from 'purplet';
import { SearchCmdOpts } from './search';

export async function handleMusicSearch(this: CommandInteraction | MessageComponentInteraction, opts: SearchCmdOpts) {
  const { query } = opts;

  const url = `https://api.spotify.com/v1/search?${new URLSearchParams({
    type: 'track',
    query,
    limit: '1',
  })}`;

  console.log(url);

  const req = await fetch(url, {
    headers: new Headers({
      Authorization: `Bearer ${process.env.SPOTIFY_TOKEN}`,
      'Content-Type': 'application/json',
    }),
  });

  const res: any = await req.json();

  const track = res.tracks.items[0];

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `Spotify - Results for ${query}`,
        })
        .setTitle(track.name)
        .setURL(track.external_urls.spotify)
        .addField(
          'Artists',
          track.artists.map((a) => `**[${a.name}](${a.external_urls.spotify})**`).join(', ')
        )
        .addField('Album', `**[${track.album.name}](${track.album.external_urls.spotify})**`)
        .setThumbnail(track.album.images[0].url)
        .setColor(await getColor(this.user)),
    ],
    components: components(
      row(
        new MessageButton()
          .setStyle('LINK')
          .setLabel('Open in Spotify')
          .setURL(track.external_urls.spotify)
      )
    ),
    files: [new MessageAttachment(Buffer.from(JSON.stringify(res, null, 2)), 'res.json')],
    ephemeral: opts.anonymous,
  };
}
