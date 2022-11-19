import { links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import dedent from 'dedent';
import { MessageButton } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'help',
  description: 'Returns a quick help guide for CRBT.',
  async handle() {
    const showAdButton = !this.guild || this.guild.ownerId !== this.user.id;
    const introImage = 'https://i.imgur.com/rUHqMcy.gif';

    await this.reply({
      embeds: [
        {
          author: {
            name: `${this.client.user.username} - Quick Guide`,
            iconURL: avatar(this.client.user, 64),
          },
          description: dedent`
          Type \`/\` in the chat box and click <:CRBT:860947227887403048> to get a list of commands.
          You can also right click or long-press a message or a user for some quick actions!

          CRBT comes with handy commands and powerful features, like creating reminders (${slashCmd(
            'reminder new'
          )}), announcing new and leaving members (${slashCmd(
            'settings'
          )}), exploiting Discord and web info (${slashCmd('search')}, ${slashCmd(
            'user info'
          )}, ${slashCmd('define')}, etc.)...

          ...with many more to come! Stay up to date on CRBT news by joining **[our server](${
            links.discord
          })**!
          `,
          image: { url: introImage },
          color: await getColor(this.user),
          fields: showAdButton
            ? [
                {
                  name: 'Like CRBT?',
                  value: 'Support us by adding it to your server!',
                },
              ]
            : [],
        },
      ],
      components: showAdButton
        ? components(
            row(new MessageButton().setStyle('LINK').setLabel('Add to Server').setURL(links.invite))
          )
        : null,
    });
  },
});
