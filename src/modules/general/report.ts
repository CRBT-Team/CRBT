import { colors, emojis, misc } from '$lib/db';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'report',
  description: 'Send a bug report to the CRBT developers.',
  options: new OptionBuilder()
    .string('message', 'The bug report to send (in english, please).', true)
    .string('image_url', 'An image URL (PNG, JPG, WEBP or GIF) to attach to the report.')
    .boolean(
      'anonymous',
      "Whether to send the report anonymously. You won't be able to receive a DM once it's fixed."
    ),
  async handle({ message, image_url, anonymous }) {
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.success} Bug report sent!`)
          .setDescription(
            `Your bug report has been sent to the CRBT developers.\nWe will review it and try our best to fix it as soon as possible.` +
              (!anonymous ? '\nA message will be sent to you whenever the bug is fixed.' : '')
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
          ? `${this.user} in ` +
              (this.channel.type === 'DM'
                ? `DMs`
                : `**[${(await this.guild.fetch()).name}](${
                    ((await this.fetchReply()) as Message).url
                  })**` + `\`\`\`\n${message.replaceAll('\\', '\\\\')}\`\`\``)
          : `Anonymously reported\n\`\`\`\n${message.replaceAll('\\', '\\\\')}\`\`\``
      )
      .addField('Status', 'Pending', true)
      .setColor(`#${colors.yellow}`);

    if (image_url && image_url.match(/(https?:\/\/.*\.(?:png|jpeg|jpg|webp|gif))/i)) {
      e.setImage(image_url);
    }

    await channel.send({
      embeds: [e],
    });
  },
});
