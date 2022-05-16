import { links } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
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
          'There are also some commands you can quickly access by right clicking on a message or a user! (Desktop only)\n' +
          'You can do some much with CRBT, like:\n' +
          'Setting reminders, linking a text channel to a voice channel, getting info on a user/server/emoji/role... \n\n' +
          `...with many more to come! Stay up to date on CRBT news by visiting **[our website](https://crbt.app)**!`
      )
      .setImage('https://cdn.clembs.xyz/rUHqMcy.gif')
      .setColor(await getColor(this.user));

    if (this.channel.type === 'DM' || this.guild.ownerId !== this.user.id) {
      e.addField('Like CRBT?', 'Support us by adding it to your server!');
    }

    await this.reply({
      embeds: [e],
      components:
        this.channel.type === 'DM' || this.guild.ownerId !== this.user.id
          ? components(
              row(
                new MessageButton().setStyle('LINK').setLabel('Add to Server').setURL(links.invite)
              )
            )
          : null,
    });
  },
});
