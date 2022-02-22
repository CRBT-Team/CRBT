import { colors, emojis, misc } from '$lib/db';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'suggest',
  description: 'Send a bug report to the CRBT developers.',
  options: new OptionBuilder().string(
    'message',
    'The bug report to send (in english, please).',
    true
  ),
  async handle({ message }) {
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.success} Thanks!`)
          .setDescription(
            `Your suggestion has been sent to the CRBT developers.\nWe will review it and who knows, it may be added!. If it does, we will DM you with the results.`
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
            .setTitle('Suggestion')
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
