import { colors, emojis, illustrations, misc } from '$lib/db';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'issue create',
  description: 'Send a bug report or a suggestion to the CRBT developers.',
  options: new OptionBuilder().string('message', 'The message to send (in english, please).', true),
  async handle({ message }) {
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Issue sent.',
            iconURL: illustrations.success,
          })
          .setDescription(
            `We will review it and who knows, it may be added! Whatever the case, we will DM once your suggestion is reviewed.`
          )
          .setColor(`#${colors.success}`),
      ],
    });

    const channel = (await this.client.channels.fetch(
      this.client.user.id === misc.CRBTid ? misc.channels.report : misc.channels.reportDev
    )) as TextChannel;

    await channel
      .send({
        embeds: [
          new MessageEmbed()
            .setTitle('Issue')
            .setDescription(`${this.user}:` + `\`\`\`\n${message.replaceAll('\\', '\\\\')}\`\`\``)
            .addField('Status', 'Pending', true)
            .setColor(`#${colors.yellow}`),
        ],
      })
      .then((msg) => {
        msg.react(emojis.misc.thumbsup).then(() => msg.react(emojis.misc.thumbsdown));
      });
  },
});
