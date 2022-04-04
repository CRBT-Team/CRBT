import { colors, emojis, illustrations, misc } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { row } from '$lib/functions/row';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { showModal } from '$lib/functions/showModal';
import { Message, MessageButton, MessageEmbed, Modal, TextInputComponent, User } from 'discord.js';
import { ButtonComponent, components, TextCommand } from 'purplet';

export default TextCommand({
  name: 'fix',
  async handle([id]) {
    if (this.author.id !== '327690719085068289') return;

    if (
      this.channel.id !==
      (this.client.user.id === misc.CRBTid ? misc.channels.report : misc.channels.reportDev)
    )
      return;

    const msg = await this.channel.messages.fetch(id);

    await issueReply('fix', msg, this.author);
    await this.delete();
  },
});

export const issueReply = async (
  type: 'reply' | 'fix' | 'refuse',
  msg: Message,
  user: User,
  message?: string
) => {
  const { author, title, description, image, fields, footer, timestamp, url, thumbnail } =
    msg.embeds[0];

  // detect if we're using the newer V2 issues
  const V2 = !!footer && !!author;

  const isSuggestion = author?.name?.includes('suggest');

  const target = V2
    ? await msg.client.users.fetch(footer.text.split(' ')[2])
    : await msg.client.users.fetch(description.split('>')[0].replace(/<@!?([0-9]*)/gm, '$1'));

  await msg.edit({
    embeds: [
      new MessageEmbed({
        author,
        title,
        url,
        description,
        image,
        footer,
        timestamp,
        thumbnail,
      })
        .addFields(
          message
            ? [
                ...fields.slice(0, fields.length - 1),
                {
                  name: `${user.id === target.id ? '[OP]' : '[DEV]'} ${user.tag} replied`,
                  value: message,
                },
              ]
            : fields.slice(0, fields.length - 1)
        )
        .addField(
          'Status',
          type === 'reply'
            ? '<:pending:954734893072519198> Pending'
            : type === 'fix'
            ? `${emojis.success} ${isSuggestion ? 'Accepted' : 'Fixed'}`
            : `${emojis.error} Denied`
        )
        .setTimestamp()
        .setColor(`#${colors[type === 'reply' ? 'yellow' : type === 'fix' ? 'success' : 'error']}`),
    ],
  });

  if (!target) return;
  if (target.id === user.id && target.id !== '327690719085068289') return;

  const issue = V2 ? title : description.split('```\n')[1].split('```')[0].trim();
  const trimmed = issue.length > 30 ? `${issue.slice(0, 30)}...` : issue;

  if (isSuggestion && type !== 'reply') {
    msg.thread.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `Suggestion ${type === 'fix' ? 'accepted' : 'denied'}`,
            iconURL: illustrations.information,
          })
          .setDescription(
            `As ${user.tag} ${
              type === 'fix' ? 'accepted' : 'denied'
            } this suggestion, this thread will be closed.`
          )
          .setColor(`#${colors[type === 'fix' ? 'success' : 'error']}`),
      ],
    });

    await msg.thread
      .setName(`${type === 'fix' ? '✅' : '❌'} - ${title}`)
      .then((t) => t.setArchived(true, `Suggestion ${type === 'fix' ? 'accepted' : 'denied'}`));
  }

  await target
    .send({
      embeds: [
        createCRBTmsg({
          type: 'issue',
          user,
          subject:
            type === 'reply'
              ? `A CRBT developer has replied to your ${isSuggestion} "${trimmed}"`
              : type === 'fix'
              ? `Your ${isSuggestion ? 'suggestion' : 'issue'} "${trimmed}" has been ${
                  isSuggestion ? 'accepted' : 'fixed'
                }`
              : `Your ${isSuggestion ? 'suggestion' : 'issue'} "${trimmed}" has been denied`,
          message,
        }).setColor(
          `#${colors[type === 'reply' ? 'yellow' : type === 'fix' ? 'success' : 'error']}`
        ),
      ],
      components: components(
        row(
          new MessageButton()
            .setStyle('LINK')
            .setLabel(`Jump to ${isSuggestion ? 'suggestion' : 'issue'}`)
            .setURL(msg.url),
          type === 'reply'
            ? new ReplyButton({ state: type }).setLabel('Reply').setStyle('SECONDARY')
            : null
        )
      ),
    })
    .catch(() => {});
};

export const ReplyButton = ButtonComponent({
  async handle({ state }) {
    if (state !== 'reply') {
      return this.reply(CRBTError("You can't reply to an issue that has been closed."));
    }

    const issueId = (this.message.components[0].components[0] as MessageButton).url.split('/')[6];

    const modal = new Modal()
      .setTitle('Reply to issue')
      .setCustomId(`replytoissue_${issueId}`)
      .setComponents(
        //@ts-ignore
        row(
          new TextInputComponent()
            .setCustomId('replymessage')
            .setLabel('Message')
            .setStyle('PARAGRAPH')
            .setPlaceholder('Your reply to the issue. Make it short and concise.')
            .setMinLength(10)
            .setMaxLength(120)
            .setRequired(true)
        )
      );

    await showModal(modal, this);
  },
});
