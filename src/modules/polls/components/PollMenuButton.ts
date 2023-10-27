import { emojis } from '$lib/env';
import { findEmojis } from '$lib/functions/findEmojis';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { trimArray } from '$lib/functions/trimArray';
import { t } from '$lib/language';
import { MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import { ButtonInteraction, Message } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getPollData, parseOptionName } from '../_helpers';
import { CancelPollButton } from './CancelPollButton';
import { EditPollButton } from './EditPollButton';
import { EndPollButton } from './EndPollButton';
import { VoteButton } from './VoteButton';

export const PollMenuButton = ButtonComponent({
  async handle(creatorId: string) {
    return this.reply(await renderMenuButton.call(this, this.message.id, creatorId));
  },
});

export async function renderMenuButton(
  this: ButtonInteraction,
  messageId: string,
  creatorId?: string,
) {
  const { strings } = t(this, 'poll');
  const pollData = await getPollData(this.channel.id, messageId);
  const message: Message =
    messageId === this.message.id
      ? (this.message as Message)
      : await this.channel.messages.fetch(messageId);
  const choicesNames: string[] = message.embeds[0].fields.map(({ name }) => name);
  const choices = pollData.choices as string[][];

  if (
    this.user.id !== creatorId &&
    !hasPerms(this.memberPermissions, PermissionFlagsBits.ManageMessages)
  ) {
    const choiceId = choices.findIndex((choice) => choice.find((voter) => voter === this.user.id));

    //TODO: make this UI nicer
    return {
      embeds: [
        {
          title: `${t(this, 'POLL')} - ${message.embeds[0].title}`,
          description: t(this, 'POLL_MENU_VOTE_DESCRIPTION'),
          color: message.embeds[0].color,
        },
      ],
      flags: MessageFlags.Ephemeral,
      components: components(
        row().addComponents(
          choicesNames.map((choice, index) => {
            const choiceEmoji = findEmojis(choice)[0] || null;
            const choiceText = parseOptionName(choice);

            return new VoteButton({ messageId, choiceId: index.toString() })
              .setLabel(choiceText)
              .setDisabled(index === choiceId)
              .setStyle('PRIMARY')
              .setEmoji(choiceEmoji);
          }),
        ),
      ),
    };
  }

  return {
    embeds: [
      {
        title: `${t(this, 'POLL')} - ${strings.DATA_AND_OPTIONS}`,
        fields: choices.map((choice, index) => ({
          name: choicesNames[index],
          value: choice.length
            ? trimArray(
                choice.map((id) => `<@${id}>`),
                this.locale,
                15,
              ).join(', ')
            : strings.POLL_DATA_NOVOTES,
        })),
        footer: {
          text: strings.POLL_DATA_FOOTER,
        },
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(
        new EditPollButton(messageId)
          .setLabel(t(this, 'EDIT'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('SECONDARY'),
        new EndPollButton(messageId)
          .setLabel(t(this, 'END_NOW'))
          .setStyle('DANGER')
          .setEmoji(emojis.buttons.cross),
        new CancelPollButton(messageId)
          .setLabel(t(this, 'CANCEL'))
          .setStyle('DANGER')
          .setEmoji(emojis.buttons.trash_bin),
      ),
    ),
    ephemeral: true,
  };
}
