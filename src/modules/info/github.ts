import { tokens } from '$lib/db';
import { getColor } from '$lib/functions/getColor';
import { trimURL } from '$lib/functions/trimURL';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'github',
  description: "Get a user's GitHub profile, or view a repository from them.",
  options: new OptionBuilder()
    .string('username', 'A GitHub username or organization.', true)
    .string('repository', 'A GitHub repository.'),
  async handle({ username, repository }) {
    if (!repository) {
      const user = (await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: tokens.github,
        },
      }).then((r) => r.json())) as any;

      console.log(user);
      const joined = dayjs(user.created_at).unix();
      const updated = dayjs(user.updated_at).unix();

      return this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${user.name} - GitHub user info`,
              iconURL: 'https://cdn.clembs.xyz/1OGU699.png',
              url: user.html_url,
            })
            .setDescription(
              `**[Open in GitHub](${user.html_url})**${
                user.twittter_username
                  ? ` | **[Twitter](https://twitter.com/${user.twitter_username})**`
                  : ''
              } ${user.blog ? ` | **[${trimURL(user.blog)}](${user.blog})**` : ''}`
            )
            .addField('Bio', user.bio ?? 'None')
            .addField('Hireable', user.hireable ? 'Yes' : 'No', true)
            .addField('Email', user.email ?? 'None', true)
            .addField('Location', user.location ?? 'None', true)
            .addField(
              'Stats',
              `
**[${user.followers ?? '0'} ${user.followers === 1 ? 'follower' : 'followers'}](${
                user.html_url
              }?tab=followers)** | **[${user.following ?? '0'} following](${
                user.html_url
              }?tab=following)** | **[${user.public_repos ?? '0'} public ${
                user.public_repos === 1 ? 'repository' : 'repositories'
              }](${user.html_url}?tab=repositories)** | **[${user.public_gists ?? '0'} public ${
                user.public_gists === 1 ? 'gist' : 'gists'
              }](https://gist.github.com/${user.login})**`
            )
            .addField('Joined', `<t:${joined}>\n<t:${joined}:R>`, true)
            .addField('Updated', `<t:${updated}>\n<t:${updated}:R>`, true)
            .setThumbnail(user.avatar_url)
            .setColor(await getColor(this.user)),
        ],
      });
    }
  },
});
