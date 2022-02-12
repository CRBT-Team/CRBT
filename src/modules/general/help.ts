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
        "Most of CRBT's commands are **Slash Commands**, which always start with `/`. Type slash in the chat box and choose CRBT to get started!\n" +
          'There are also some **Context menu Commands**, which are used by right clicking a message or a user! (Desktop only)\n' +
          'To get a full list of commands, just type `/` and click <:CRBT:860947227887403048>!\n' +
          "Here's a few things you can do with CRBT:" +
          '- Right click a user to get their avatar or their full info.\n' +
          '- Right click a message to save it for later, translate it to your language or even scan any QR codes!\n' +
          '- `/emoji info`, which enlarges any Discord emoji and gets you extra info about it!\n' +
          "- `/color set` to change CRBT's accent color for you, as seen on the side of its messages.\n" +
          '- `/voice-linker set`, links a text channel\'s visibility to the voice channel of your choice! Useful for "no-mic" or "voice-text" channels!\n' +
          '- `/remind me` to remind you of anything at any given time.\n\n' +
          `...and many more to come each month! Stay tuned by joining **[our server](${links.discord})**!`
      )
      .setColor(await getColor(this.user));

    if (this.guild.ownerId !== this.user.id) {
      e.addField('Like CRBT?', 'Support us by adding it to your server!');
    }

    await this.reply({
      embeds: [e],
      components:
        this.guild.ownerId !== this.user.id
          ? components(
              row(
                new MessageButton().setStyle('LINK').setLabel('Add to Server').setURL(links.invite)
              )
            )
          : null,
    });
  },
});
