import { channels, colors, clients, icons, links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { AchievementProgress } from '$lib/responses/Achievements';
import { rest } from '$lib/rest';
import { Routes } from 'discord-api-types/v10';
import { MessageEmbed, TextInputComponent } from 'discord.js';
import { ChatCommand, ModalComponent, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'report',
  description: 'File a new bug report on the Discord server.',
  options: new OptionBuilder().attachment('image', 'An image to attach to the report.'),
  async handle({ image }) {
    if (image && !image.contentType.startsWith('image/')) {
      CRBTError(this, 'You can only upload images');
    }

    const modal = new Modal(image ? `${this.commandId}/${image.id}/${image.name}` : null)
      .setTitle('New bug report')
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
  async handle(image_url?: string) {

    const title = this.fields.getTextInputValue('issue_title');
    const description = this.fields.getTextInputValue('issue_description');

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Report sent successfully.',
            iconURL: icons.success,
          })
          .setDescription(
            `Your report has been sent to the **[CRBT Community](${links.discord})**.\nWe will review it, and you'll get notified on developer messages through your DMs.`
          )
          .setColor(colors.success),
      ],
      ephemeral: true,
    });

    // const image = image_url
    //   ? new MessageAttachment(
    //   ).setName('image.png')
    //   : null;

    const e = new MessageEmbed()
      .setAuthor({
        name: `${this.user.tag} filed a bug report`,
        iconURL: avatar(this.user, 64),
      })
      .setTitle(title)
      .setDescription(description)
      // .addFields({
      //   name: 'Status',
      //   value: `${emojis.pending} Pending`,
      //   inline: true
      // })
      .setImage(image_url ? 'attachment://image.png' : null)
      .setFooter({ text: `User ID: ${this.user.id} • Last update` })
      .setTimestamp()
      .setColor(colors.yellow);

    await rest.post(Routes.threads(
      this.client.user.id === clients.crbt.id ? channels.report : channels.reportDev
    ), {
      body: {
        name: title,
        message: {
          embeds: [e.toJSON()],
        }
      },
      files: image_url ? [{
        data: `https://cdn.discordapp.com/ephemeral-attachments/${image_url}`,
        name: 'image.png'
      }] : null,
    })

    await AchievementProgress.call(this, 'BUG_HUNTER');
  },
});
