import { colors } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'quote',
  description: 'Quote a message using a link.',
  options: new OptionBuilder().string('message_link', 'A link to the message to quote.', {
    required: true,
  }),
  async handle({ message_link }) {
    const msgUrlRegex = /https:\/\/((canary|ptb)\.)?discord.com\/channels(\/\d{17,20}){3}/;

    if (!msgUrlRegex.test(message_link)) {
      return CRBTError(this, 'The message link provided is invalid.');
    }

    const guildId = message_link.split('/')[4];
    const channelId = message_link.split('/')[5];
    const messageId = message_link.split('/')[6];

    const guild =
      this.client.guilds.cache.get(guildId) ?? (await this.client.guilds.fetch(guildId));

    if (!guild) {
      return CRBTError(this, 'The server ID that you used is either invalid, or I was not added to this server. To do so, click CRBT then "Add to Server".')
    }

    const channel = await guild.channels.fetch(channelId);

    if (!channel.isText()) {
      return CRBTError(this, 'The channel ID that you provided is invalid.');
    }

    const message = await channel.messages.fetch(messageId);

    if (!message) {
      return CRBTError(this, 'The message ID that you provided is invalid.');
    }

    const { JUMP_TO_MSG } = t(this, 'genericButtons');

    const firstEmbeds = [
      new MessageEmbed()
        .setAuthor({
          name: `${message.author.tag} (Quoted message)`,
          iconURL: avatar(message.author, 64),
        })
        .setDescription(message.content)
        .setImage(message.attachments.size ? message.attachments.first()?.proxyURL : undefined)
        .setTimestamp(message.createdAt)
        .setFooter({
          text: `${guild.name} • #${channel.name}`,
        })
        .setColor(message.member.displayColor ?? colors.blurple)
        .setURL(message.url),
      ...message.embeds.slice(0, 4),
    ];

    console.log(message.embeds.length);

    if (message.embeds.length <= 4) {
      await this.reply({
        embeds: firstEmbeds,
        components: components(
          row(new MessageButton().setLabel(JUMP_TO_MSG).setStyle('LINK').setURL(message.url))
        ),
      });
    } else {
      await this.reply({
        embeds: firstEmbeds,
      });

      await this.channel.send({
        embeds: message.embeds.slice(4),
        components: components(
          row(new MessageButton().setLabel(JUMP_TO_MSG).setStyle('LINK').setURL(message.url))
        ),
      });
    }
  },
});
