import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { Packument, PackumentVersion } from '$lib/types/apis/npm';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

// TODO: fix all of that mess

export default ChatCommand({
  name: 'npm',
  description: 'Search a package on npm.',
  options: new OptionBuilder().string('package', 'The package package to search.', true),
  async handle({ package: pkg }) {
    const req = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);

    if (!req.ok) {
      return this.reply(CRBTError("Couldn't find a package with that name. Try again."));
    }

    const res = (await req.json()) as Packument;
    const cur = res.versions[res['dist-tags'].latest] as PackumentVersion;
    const { downloads } = (await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`
    ).then((r) => r.json())) as any;

    const e = new MessageEmbed()
      .setAuthor({
        name: `${res.name} - NPM package info`,
        url: `https://npmjs.org/package/${cur.name}`,
        iconURL: 'https://cdn.clembs.xyz/ZgJCsA8.png',
      })
      .setDescription(
        `**[Open in browser](https://npmjs.org/package/${cur.name})**\n${
          cur.description.length > 1024 ? `${cur.description.slice(0, 1021)}...` : cur.description
        }`
      )
      .addField(
        'Current version',
        `${res['dist-tags'].latest} - Published on <t:${dayjs(res.time.modified).unix()}>`
      )
      .addField('Weekly Downloads', downloads.toLocaleString())
      .setColor(await getColor(this.user))
      .setFooter({
        text: `Source: npmjs.org`,
      });

    if (cur.keywords && cur.keywords.length > 0) {
      e.addField('Keywords', `\`\`\`\n${cur.keywords.join(', ')}\`\`\``);
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
    });
  },
});
