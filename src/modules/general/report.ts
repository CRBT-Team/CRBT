import { colors, emojis, misc } from '$lib/db';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'report',
  description: 'Send a bug report to the CRBT developers.',
  options: new OptionBuilder()
    .string('message', 'The bug report to send (in english, please).', true)
    .string('attachment', 'An image to send with the report.')
    .boolean('anonymous', 'Whether to send the report anonymously.'),
  async handle({ message, attachment, anonymous }) {
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.success} Bug report sent!`)
          .setDescription(
            `Your bug report has been sent to the CRBT developers.\nWe will review and try our best to fix it as soon as possible.\nA message will be sent to you whenever the bug is fixed.`
          )
          .setColor(`#${colors.success}`),
      ],
    });

    const channel = (await this.client.channels.fetch(
      this.client.user.id === misc.CRBTid ? misc.channels.report : misc.channels.reportDev
    )) as TextChannel;

    const e = new MessageEmbed()
      .setTitle('Bug report')
      .setDescription(
        !anonymous
          ? `${this.user} in **[${(await this.guild.fetch()).name}](${
              ((await this.fetchReply()) as Message).url
            })**` +
              '\n' +
              `\`\`\`\n${message.replace('\\', '\\\\')}\`\`\``
          : `Anonymously reported\n\`\`\`\n${message.replace('\\', '\\\\')}\`\`\``
      )
      .setColor(`#${colors.yellow}`);

    if (attachment && attachment.match(/(https?:\/\/.*\.(?:png|jpg|webp|gif))/i)) {
      e.setImage(attachment);
    }

    await channel.send({
      embeds: [e],
    });
  },
});
