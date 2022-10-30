import { channels, clients, colors, emojis, links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { AchievementProgress } from '$lib/responses/Achievements';
import { MessageFlags, Routes } from 'discord-api-types/v10';
import { TextInputComponent } from 'discord.js';
import fetch from 'node-fetch';
import { writeFileSync } from 'node:fs';
import { ChatCommand, getRestClient, ModalComponent, OptionBuilder, row } from 'purplet';

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

    const imageBuffer = image_url
      ? Buffer.from(
          await fetch(`https://cdn.discordapp.com/ephemeral-attachments/${image_url}`).then((r) =>
            r.arrayBuffer()
          )
        )
      : null;

    writeFileSync('image.png', imageBuffer);

    await getRestClient().post(
      Routes.threads(
        this.client.user.id === clients.crbt.id ? channels.report : channels.reportDev
      ),
      {
        passThroughBody: true,
        body: {
          applied_tags:
            this.client.user.id === clients.crbt.id
              ? ['1019657549554913360', '1019657874181468190']
              : null,
          name: title,
          message: {
            embeds: [
              {
                author: {
                  name: `${this.user.tag} filed a bug report`,
                  icon_url: avatar(this.user),
                },
                title,
                description,
                // image: image_url ? 'attachment://image.png' : null,
                footer: { text: `User ID: ${this.user.id}` },
                color: colors.yellow,
              },
            ],
          },
        },
        files: image_url
          ? [
              {
                data: imageBuffer,
                key: 'files[0]',
                name: 'image.png',
              },
            ]
          : null,
      }
    );

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} Report sent successfully.`,
          description: `It was sent to the **[CRBT Community](${links.discord})** where other members can discuss the issue.\nWe will review it, and you'll get notified on developer messages through your DMs.`,
          color: colors.success,
        },
      ],
      flags: MessageFlags.Ephemeral,
    });

    await AchievementProgress.call(this, 'BUG_HUNTER');
  },
});
