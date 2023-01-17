import { channels, clients, colors, emojis, links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { ButtonStyle, ComponentType, Routes } from 'discord-api-types/v10';
import { GuildTextBasedChannel, MessageAttachment, TextInputComponent } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, getRestClient, ModalComponent, OptionBuilder, row } from 'purplet';
import pjson from '../../../package.json';

export default ChatCommand({
  name: 'report',
  description: 'Report a CRBT-related issue, bug, typo or any problem.',
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
            .setPlaceholder("What's the problem?")
            .setStyle('SHORT')
            .setMinLength(10)
            .setMaxLength(50)
            .setRequired(true)
        ),
        row(
          new TextInputComponent()
            .setCustomId('issue_description')
            .setLabel('Description')
            .setPlaceholder('Describe your report in detail.')
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

    const privateData = JSON.stringify(
      {
        guild: {
          id: this.guildId ?? 'DM',
          channelId: this.channelId,
          locale: this.guildLocale,
        },
        user: {
          id: this.user.id,
          permissions: this.memberPermissions,
          locale: this.locale,
        },
        bot: {
          permissions: this.appPermissions,
          version: pjson.version,
        },
      },
      null,
      2
    );

    await this.deferReply({
      ephemeral: true,
    });

    const channel = (await this.client.channels.fetch(
      channels.privateReports
    )) as GuildTextBasedChannel;
    const { url } = await channel.send({
      files: [new MessageAttachment(Buffer.from(privateData)).setName('data.json')],
    });

    await getRestClient().post(
      Routes.threads(
        this.client.user.id === clients.crbt.id ? channels.report : channels.reportDev
      ),
      {
        passThroughBody: !!image_url,
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
                color: colors.yellow,
              },
            ],
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    label: 'Data',
                    url,
                    emoji: {
                      name: '🔒',
                    },
                    style: ButtonStyle.Link,
                  },
                ],
              },
            ],
          },
        },
        files: image_url
          ? [
              {
                data: imageBuffer,
                name: 'image.png',
              },
            ]
          : null,
      }
    );

    await this.editReply({
      embeds: [
        {
          title: `${emojis.success} Report sent successfully.`,
          description: `It was sent to the **[CRBT Community](${links.discord})** where other members can discuss the issue.\nWe will review it, and you'll get notified on developer messages through your DMs.`,
          color: colors.success,
        },
      ],
    });
  },
});
