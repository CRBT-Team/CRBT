import { colors, emojis, icons, links, channels, clients } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { MessageEmbed, TextChannel, TextInputComponent } from 'discord.js';
import { ChatCommand, ModalComponent, row } from 'purplet';

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
            .setPlaceholder('What do you want to suggest?')
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
    const desc = this.fields.getTextInputValue('suggest_description');
    const channel = (await this.client.channels.fetch(
      this.client.user.id === clients.crbt.id ? channels.suggestions : channels.reportDev
    )) as TextChannel;

    const msg = await channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${this.user.tag} suggested`,
            iconURL: avatar(this.user, 64),
          })
          .setTitle(title)
          .setDescription(desc)
          .addField('Status', `${emojis.pending} Pending`, true)
          .setFooter({ text: `User ID: ${this.user.id} • Last update` })
          .setTimestamp()
          .setColor(colors.yellow),
      ],
    });

    await msg.react(emojis.thumbsup);
    await msg.react(emojis.thumbsdown);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Suggestion sent successfully.',
            iconURL: icons.success,
          })
          .setDescription(
            `You can view your suggestion **[here](${msg.url})** ([join CRBT Community](${links.discord})).`
          )
          .setColor(colors.success),
      ],
      ephemeral: true,
    });
  },
});
