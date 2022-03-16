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
    const cur = res[res['dist-tags'].latest] as PackumentVersion;

    const e = new MessageEmbed()
      .setAuthor({
        name: `${cur.name} - NPM package info`,
        url: cur.links.npm,
        iconURL: 'https://cdn.clembs.xyz/ZgJCsA8.png',
      })
      .setDescription(
        `**[Open in browser](${pkgInfo.metadata.links.npm})**\n${
          pkgInfo.metadata.description.length > 1024
            ? `${pkgInfo.metadata.description.slice(0, 1021)}...`
            : pkgInfo.metadata.description
        }`
      )
      .addField(
        'Current version',
        `${pkgInfo.metadata.version} - Published on <t:${dayjs(pkgInfo.metadata.date).unix()}>`
      )
      .addField('Weekly Downloads', pkgInfo.npm.downloads.at(-1).count.toLocaleString())
      .setColor(await getColor(this.user))
      .setFooter({
        text: `Source: npms.io • Analyzed at ${analyzedAt.split('T')[0]}`,
      });

    if (pkgInfo.metadata.keywords && pkgInfo.metadata.keywords.length > 0) {
      e.addField('Keywords', `\`\`\`\n${pkgInfo.metadata.keywords.join(', ')}\`\`\``);
    }
    if (pkgInfo.metadata.license) {
      e.addField('License', pkgInfo.metadata.license, true);
    }
    e.addField('Publisher', pkgInfo.metadata.publisher.username, true).addField(
      'Maintainers',
      pkgInfo.metadata.maintainers.map((m) => m.username).join(', '),
      true
    );

    if (pkgInfo.metadata.author) {
      e.addField(
        'Author',
        `**[${pkgInfo.metadata.author.name}](${pkgInfo.metadata.author.url})**`,
        true
      );
    }
    if (pkgInfo.metadata.repository) {
      e.addField(
        'Repository',
        `**${pkgInfo.metadata.repository.url.replace(
          // regex to remove git+ prefix and the .git suffix
          /^git\+https:\/\/github.com\/(.+)\.git$/,
          '$1'
        )}**`
      );
    }

    await this.reply({
      embeds: [e],
    });
  },
});
