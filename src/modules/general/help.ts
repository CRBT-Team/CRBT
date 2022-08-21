import { links } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'help',
  description: 'Returns a quick help guide for CRBT.',
  async handle() {
    const e = new MessageEmbed()
      .setAuthor({
        name: `${this.client.user.username} - Quick Guide`,
        iconURL: avatar(this.client.user, 64),
      })
      .setDescription(
        'Type `/` in the chat box and click <:CRBT:860947227887403048> to get a list of commands!\n' +
          'There are also some commands you can quickly access by right clicking or long-pressing a message or a user.\n' +
          'Handy commands and powerful feature come with CRBT, including:\n' +
          `Setting reminders (${slashCmd(
            'reminder new'
          )}), announcing new and leaving members (${slashCmd(
            'welcome message'
          )}), getting info (${slashCmd('emoji info')}, ${slashCmd('user info')}, ${slashCmd(
            'server info'
          )}, etc.)... \n\n` +
          `...with many more to come! Stay up to date on CRBT news by visiting **[our blog](https://crbt.app/blog)**!`
      )
      .setImage('https://cdn.clembs.xyz/rUHqMcy.gif')
      .setColor(await getColor(this.user));

    if (!this.guild || this.guild.ownerId !== this.user.id) {
      e.addField('Like CRBT?', 'Support us by adding it to your server!');
    }

    await this.reply({
      embeds: [e],
      components:
        !this.guild || this.guild.ownerId !== this.user.id
          ? components(
              row(
                new MessageButton().setStyle('LINK').setLabel('Add to Server').setURL(links.invite)
              )
            )
          : null,
    });
  },
});
