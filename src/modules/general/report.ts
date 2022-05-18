import { colors, icons, links, misc } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import {
  Message,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
  TextInputComponent,
} from 'discord.js';
import { ChatCommand, ModalComponent, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'report',
  description: 'File a new issue on the Discord server.',
  options: new OptionBuilder().attachment('image', 'An image to attach to the report.'),
  async handle({ image }) {
    if (image && !image.contentType.startsWith('image/')) {
      this.reply(CRBTError('You can only upload images'));
    }

    const modal = new Modal(`${this.commandId}/${image.id}/${image.name}`)
      .setTitle('New issue')
      .setComponents(
        row(
          new TextInputComponent()
            .setCustomId('issue_title')
            .setLabel('Title')
            .setPlaceholder("What's the issue?")
            .setStyle('SHORT')
            .setMinLength(10)
            .setMaxLength(50)
            .setRequired(true)
        ),
        row(
          new TextInputComponent()
            .setCustomId('issue_description')
            .setLabel('Description')
            .setPlaceholder('Describe your issue in detail.')
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(500)
        )
      );

    await this.showModal(modal);
  },
});

export const Modal = ModalComponent({
  async handle(image_url: string) {
    const reportChannel = this.client.channels.cache.get(
      misc.channels[this.client.user.id === misc.CRBTid ? 'report' : 'reportDev']
    ) as TextChannel;
    const title = this.fields.getTextInputValue('issue_title');
    const desc = this.fields.getTextInputValue('issue_description');

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Issue sent successfully.',
            iconURL: icons.success,
          })
          .setDescription(
            `Your issue has been sent to the **[CRBT Community](${links.discord})**.\nWe will review it, and you'll get notified on developer messages through your DMs.`
          )
          .setColor(`#${colors.success}`),
      ],
    });

    // load image_url as an attachment

    const image = new MessageAttachment(
      `https://cdn.discordapp.com/ephemeral-attachments/${image_url}`
    ).setName('image.png');

    reportChannel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${this.user.tag} filed an issue`,
            iconURL: avatar(this.user, 64),
          })
          .setTitle(title)
          //@ts-ignore
          .setURL(this.channel.type !== 'DM' ? ((await this.fetchReply()) as Message).url : null)
          .setDescription(desc)
          .addField('Status', '<:pending:954734893072519198> Pending', true)
          .setImage('attachment://image.png')
          .setFooter({ text: `User ID: ${this.user.id} • Last update` })
          .setTimestamp()
          .setColor(`#${colors.yellow}`),
      ],
      files: [image],
    });
  },
});
