import { channels, clients, colors, emojis, links } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { CustomEmojiRegex } from '@purplet/utils';
import { APIGuildForumChannel, APIMessage, MessageFlags, Routes } from 'discord-api-types/v10';
import { TextInputComponent } from 'discord.js';
import { ChatCommand, getRestClient, ModalComponent, row } from 'purplet';

export default ChatCommand({
  name: 'suggest',
  description: 'Send a suggestion for CRBT on the Discord server.',
  async handle() {
    const modal = new Modal()
      .setTitle('New suggestion')
      .setComponents(
        row(
          new TextInputComponent()
            .setCustomId('suggest_title')
            .setLabel('Title')
            .setPlaceholder('What would you like to suggest?')
            .setStyle('SHORT')
            .setMinLength(10)
            .setMaxLength(50)
            .setRequired(true)
        ),
        row(
          new TextInputComponent()
            .setCustomId('suggest_description')
            .setLabel('Description')
            .setPlaceholder(
              'Describe your suggestion. What would it do? How would it improve CRBT?'
            )
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(500)
        )
      );

    await this.showModal(modal);
  },
});

export const Modal = ModalComponent({
  async handle(ctx: null) {
    const title = this.fields.getTextInputValue('suggest_title');
    const description = this.fields.getTextInputValue('suggest_description');

    const post = (await getRestClient().post(
      Routes.threads(
        this.client.user.id === clients.crbt.id ? channels.suggestions : channels.reportDev
      ),
      {
        body: {
          applied_tags: this.client.user.id === clients.crbt.id ? ['1025146933993553951'] : null,
          name: title,
          message: {
            embeds: [
              {
                author: {
                  name: `${this.user.tag} suggested`,
                  icon_url: avatar(this.user),
                },
                title,
                description,
                footer: { text: `User ID: ${this.user.id}` },
                color: colors.yellow,
              },
            ],
          },
        },
      }
    )) as APIGuildForumChannel & { message: APIMessage };

    await getRestClient().put(
      Routes.channelMessageOwnReaction(
        post.id,
        post.message.id,
        encodeURI(emojis.thumbsup.replace(CustomEmojiRegex, '$1:$2'))
      )
    );

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} Suggestion sent successfully.`,

          description: `It was sent on the [CRBT Community](${links.discord}) where other members can discuss it.\nJoin the server now to engage in the discussion!`,
          color: colors.success,
        },
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
});
