import { channels, clients, colors, emojis, links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ButtonStyle, ComponentType, Routes } from 'discord-api-types/v10';
import { GuildTextBasedChannel, MessageAttachment, TextInputComponent } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, getRestClient, ModalComponent, OptionBuilder, row } from 'purplet';
import pjson from '../../../package.json';

export default ChatCommand({
  name: 'report',
  description: t('en-US', 'report.description'),
  nameLocalizations: getAllLanguages('REPORT', localeLower),
  descriptionLocalizations: getAllLanguages('report.description'),
  options: new OptionBuilder().attachment('image', t('en-US', 'IMAGE_OPTION_DESCRIPTION'), {
    nameLocalizations: getAllLanguages('IMAGE', localeLower),
    descriptionLocalizations: getAllLanguages('IMAGE_OPTION_DESCRIPTION'),
  }),
  async handle({ image }) {
    if (image && !image.contentType.startsWith('image/')) {
      CRBTError(this, t(this.locale, 'ERROR_ATTACHMENT_INVALID_TYPE_IMAGE'));
    }

    const modal = new Modal(image ? `${this.commandId}/${image.id}/${image.name}` : null)
      .setTitle(t(this, 'REPORT_MODAL_TITLE'))
      .setComponents(
        row(
          new TextInputComponent()
            .setCustomId('issue_title')
            .setLabel(t(this, 'TITLE'))
            .setPlaceholder(t(this, 'REPORT_MDOAL_TITLE_PLACEHOLDER'))
            .setStyle('SHORT')
            .setMinLength(10)
            .setMaxLength(50)
            .setRequired(true)
        ),
        row(
          new TextInputComponent()
            .setCustomId('issue_description')
            .setLabel(t(this, 'DESCRIPTION'))
            .setPlaceholder(t(this, 'MODREPORTS_MODAL_DESCRIPTION_PLACEHOLDER'))
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(512)
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
          title: `${emojis.success} ${t(this, 'REPORT_SUCCESS_TITLE')}.`,
          description: t(this, 'REPORT_SUCCESS_DESCRIPTION', {
            server: links.discord,
          }),
          color: colors.success,
        },
      ],
    });
  },
});
