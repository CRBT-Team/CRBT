import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

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
        `${this.client.user.username}'s prefix is always \`/\`.` +
          '\n' +
          'To get a list of commands, as well as their descriptions, just type `/` and click <:CRBT:860947227887403048>! Here are a few examples:' +
          '\n' +
          '- `/user pfp` - Get the profile picture of someone.' +
          '\n' +
          '- `/emoji info` - Enlarge any custom or default emoji and get useful information about it.' +
          '\n' +
          "- `/color set` - Changes your CRBT's accent color, seen on the side of its messages."
      )
      .setColor(await getColor(this.user));

    if (this.guild.ownerId !== this.user.id) {
      e.addField('Like CRBT?', 'Support us by adding it to your server!');
    }
    this.reply({
      embeds: [e],
    });
  },
});
