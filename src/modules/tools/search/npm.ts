import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { time } from '$lib/functions/time';
import { CommandInteraction, MessageButton, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { components, row } from 'purplet';
import { SearchCmdOpts } from './search';

export async function handleNpm(this: CommandInteraction, opts: SearchCmdOpts) {
  const pkg = opts.query;

  const req = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);

  if (!req.ok) {
    return this.reply(CRBTError("Couldn't find a package with that name. Try again."));
  }

  const res: any = await req.json();
  const cur = res.versions[res['dist-tags'].latest];
  const { downloads } = (await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`
  ).then((r) => r.json())) as any;

  const e = new MessageEmbed()
    .setAuthor({
      name: `npm - Results for "${pkg}"`,
      iconURL: 'https://cdn.clembs.xyz/ZgJCsA8.png',
      url: 'https://npmjs.com',
    })
    .setTitle(res.name)
    .setURL(`https://npmjs.com/package/${cur.name}`)
    .setDescription(
      cur.description.length > 1024 ? `${cur.description.slice(0, 1021)}...` : cur.description
    )
    .addField(
      'Current version',
      `**${res['dist-tags'].latest}** - Published on ${time(new Date(res.time.modified), 'D')}`
    )
    .addField('Weekly Downloads', downloads.toLocaleString(this.locale))
    .setColor(await getColor(this.user));

  if (cur.keywords && cur.keywords.length > 0) {
    e.addField('Keywords', `${cur.keywords.map((k) => `\`${k}\``).join(', ')}`);
  }
  if (cur.license) {
    e.addField('License', cur.license, true);
  }
  e.addField(
    'Publisher',
    typeof cur._npmUser === 'string'
      ? cur._npmUser
      : `**[${cur._npmUser.name}](${cur._npmUser.url})**${
          cur._npmUser.email ? ` - ${cur._npmUser.email}` : ''
        }`,
    true
  ).addField(
    'Maintainers',
    cur.maintainers.map((m) => (typeof m === 'string' ? m : `${m.name}`)).join(', '),
    true
  );

  if (cur.author) {
    e.addField(
      'Author',
      typeof cur.author === 'string'
        ? `**${cur.author}**`
        : `**[${cur.author.name}](${cur.author.url})**${
            cur.author.email ? ` - ${cur.author.email}` : ''
          }`,
      true
    );
  }
  if (cur.repository) {
    e.addField(
      'Repository',
      typeof cur.repository === 'string'
        ? `**${cur.repository.replace(/^git\+(.+)\.git$/, '$1')}**`
        : `**${cur.repository.url.replace(/^git\+(.+)\.git$/, '$1')}**`,
      true
    );
  }

  await this.reply({
    embeds: [e],
    components: components(
      row(
        new MessageButton()
          .setLabel('Open in npm')
          .setURL(`https://npmjs.org/package/${cur.name}`)
          .setStyle('LINK')
      )
    ),
  });
}
