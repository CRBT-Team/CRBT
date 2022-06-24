import { colors, icons, misc } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { MessageActionRow, MessageEmbed, TextChannel, TextInputComponent } from 'discord.js';
import { ChatCommand, ModalComponent } from 'purplet';

export default ChatCommand({
  name: 'suggest',
  description: 'Send a suggestion for CRBT on the Discord server.',
  async handle() {
    const modal = new Modal().setTitle('New suggestion').setComponents(
      //@ts-ignore
      new MessageActionRow().setComponents(
        new TextInputComponent()
          .setCustomId('suggest_title')
          .setLabel('Title')
          .setPlaceholder('What do you want to suggest?')
          .setStyle('SHORT')
          .setMinLength(10)
          .setMaxLength(50)
          .setRequired(true)
      ),
      new MessageActionRow().setComponents(
        new TextInputComponent()
          .setCustomId('suggest_description')
          .setLabel('Description')
          .setPlaceholder('Describe your suggestion. What would it do? How would it improve CRBT?')
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
      misc.channels[this.client.user.id === misc.CRBTid ? 'report' : 'reportDev']
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
          .addField('Status', '<:pending:954734893072519198> Pending', true)
          .setFooter({ text: `User ID: ${this.user.id} • Last update` })
          .setTimestamp()
          .setColor(`#${colors.yellow}`),
      ],
    });

    const thread = await channel.threads.create({
      name: `🕒 - ${title}`,
      autoArchiveDuration: 'MAX',
      reason: 'CRBT Suggestion',
      type: 'GUILD_PUBLIC_THREAD',
      invitable: true,
      startMessage: msg,
    });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Suggestion sent successfully.',
            iconURL: icons.success,
          })
          .setDescription(
            `A discussion thread has been sent in the **[CRBT Community](${
              (
                await thread.parent.createInvite({
                  maxAge: 36000,
                  unique: true,
                  maxUses: 1,
                })
              ).url
            })**.\nYou can join the thread **[here](${
              msg.url
            })** to discuss with other CRBT users about it.`
          )
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });
  },
});
