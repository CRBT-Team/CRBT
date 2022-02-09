import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { userDMsEnabled } from '$lib/functions/userDMsEnabled';
import { GuildChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, MessageContextCommand, row } from 'purplet';

export default MessageContextCommand({
  name: 'Bookmark Message',
  async handle(message) {
    if (!userDMsEnabled(this.user)) {
      return this.reply(
        CRBTError(null, 'In order to bookmark messages, you must enable your DMs or unblock CRBT.')
      );
    }

    this.user.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${message.author.tag} (Bookmarked message)`,
            iconURL: avatar(message.author, 64),
          })
          .setDescription(message.content ?? '*No content*')
          .setImage(message.attachments.size ? message.attachments.first().proxyURL : undefined)
          .setTimestamp(message.createdAt)
          .setFooter({
            text: `${this.guild.name} • #${((await message.channel.fetch()) as GuildChannel).name}`,
          })
          .setColor(message.member.displayColor)
          .setURL(message.url),
        ...message.embeds,
      ],
      components: components(
        row(new MessageButton().setLabel('Jump to message').setStyle('LINK').setURL(message.url))
      ),
    });

    this.reply({
      content: `Sent message by DM!`,
      components: components(
        row(
          new MessageButton()
            .setLabel('Open DMs')
            .setStyle('LINK')
            .setURL(`https://discord.com/channels/@me/${this.user.dmChannel.id}`)
        )
      ),
      ephemeral: true,
    });
  },
});
