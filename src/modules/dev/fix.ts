import { colors, emojis, illustrations, links, misc } from '$lib/db';
import { row } from '$lib/functions/row';
import {
  Message,
  MessageButton,
  MessageEmbed,
  Modal,
  Team,
  TextInputComponent,
  User,
} from 'discord.js';
import { ButtonComponent, components, TextCommand } from 'purplet';

export default TextCommand({
  name: 'fix',
  async handle([id]) {
    if ((this.client.application.owner as Team).members.has(this.author.id))
      this.reply('You do not have permission to use this command.');

    if (
      this.channel.id !==
      (this.client.user.id === misc.CRBTid ? misc.channels.report : misc.channels.reportDev)
    )
      return;

    const msg = await this.channel.messages.fetch(id);

    await issueReply('fix', msg);
  },
});

export const issueReply = async (
  type: 'reply' | 'fix' | 'refuse',
  msg: Message,
  author: User = msg.author,
  message?: string
) => {
  const { title, description, image, fields } = msg.embeds[0];
  const user = !description.includes('Anonymously reported')
    ? await msg.client.users.fetch(description.split('>')[0].replace(/<@!?([0-9]*)/gm, '$1'))
    : null;

  await msg.edit({
    embeds: [
      new MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .addFields([
          ...fields.slice(0, fields.length - 1),
          message
            ? {
                name: `${msg.author.tag} replied`,
                value: message,
              }
            : null,
          {
            name: 'Status',
            value:
              type === 'reply'
                ? fields.at(-1).value
                : type === 'fix'
                ? `${emojis.success} Accepted or fixed`
                : `${emojis.error} Denied`,
          },
        ])
        .setImage(image?.url)
        .setColor(`#${colors[type === 'reply' ? 'yellow' : type === 'fix' ? 'success' : 'error']}`),
    ],
  });

  await msg.reactions.removeAll();

  if (!user) return;
  if (user.id === author.id) return;

  const report = description.split('```\n')[1].split('```')[0].trim();
  await user.send({
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: "You've got mail!", iconURL: illustrations.information })
        .setDescription(
          `This message was delivered by a verified CRBT developer.\nLearn more about CRBT messages **[here](${links.info.messages})**`
        )
        .addField(
          'Subject',
          `A developer replied to your issue: "${
            report.length > 30 ? `${report.slice(0, 30).trim()}...` : report
          }"`
        )
        .addFields(message ? [{ name: `Message from ${msg.author.tag}`, value: message }] : [])
        .addField(`${msg.author.tag} replied`, message)
        .setColor(`#${colors.success}`),
    ],
    components: components(
      row(
        new MessageButton().setStyle('LINK').setLabel(`Jump to issue`).setURL(msg.url),
        new ReplyButton().setLabel('Reply').setStyle('SECONDARY')
      )
    ),
  });
};

export const ReplyButton = ButtonComponent({
  async handle() {
    const modal = new Modal()
      .setTitle('Reply to issue')
      .setCustomId(`issue_${this.message.id}`)
      .setComponents(
        //@ts-ignore
        row(
          new TextInputComponent()
            .setCustomId('message')
            .setLabel('Message')
            .setStyle('PARAGRAPH')
            .setPlaceholder('Reply to the issue')
            .setMinLength(15)
            .setMaxLength(150)
            .setRequired(true)
        )
      );

    await this.showModal(modal);
    // await getRestClient().post(`/interactions/${this.id}/${this.token}/callback`, {
    //   body: {
    //     type: 9,
    //     data: modal.toJSON(),
    //   },
    //   headers: {
    //     Authorization: `Bot ${this.client.token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
  },
});
