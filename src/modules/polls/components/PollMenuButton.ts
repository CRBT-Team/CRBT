import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { findEmojis } from '$lib/functions/findEmojis';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { trimArray } from '$lib/functions/trimArray';
import { t } from '$lib/language';
import { CustomEmojiRegex } from '@purplet/utils';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ButtonComponent, components, row } from 'purplet';
import { getPollData } from '../_helpers';
import { CancelPollButton } from './CancelPollButton';
import { EditPollButton } from './EditPollButton';
import { EndPollButton } from './EndPollButton';
import { VoteButton } from './VoteButton';

export const PollMenuButton = ButtonComponent({
  async handle(creatorId: string) {
    const { strings, errors } = t(this, 'poll');
    const pollData = await getPollData(`${this.channel.id}/${this.message.id}`);
    const choicesNames: string[] = this.message.embeds[0].fields.map(({ name }) => name);
    const choices = pollData.choices as string[][];

    if (
      this.user.id !== creatorId &&
      !hasPerms(this.memberPermissions, PermissionFlagsBits.ManageMessages)
    ) {
      const choiceId = choices.findIndex((choice) =>
        choice.find((voter) => voter === this.user.id)
      );

      this.reply({
        embeds: [
          {
            title: strings.POLL_DATA_OPTIONS,
            description: `your current vote is "${choicesNames[choiceId]}"`,
          },
        ],
        components: components(
          row().addComponents(
            choicesNames.map((choice, index) => {
              const choiceEmoji = findEmojis(choice)[0] || null;
              const choiceText = choice.replace(CustomEmojiRegex, '');

              return new VoteButton({ choiceId: index.toString() })
                .setLabel(choiceText)
                .setStyle('PRIMARY')
                .setEmoji(choiceEmoji);
            })
          )
        ),
      });

      return CRBTError(this, errors.POLL_DATA_NOT_ALLOWED);
    }

    this.reply({
      embeds: [
        {
          title: strings.POLL_DATA_OPTIONS,
          fields: choices.map((choice, index) => ({
            name: `${choicesNames[index]} (${choice.length})`,
            value:
              choice.length > 0
                ? trimArray(
                    choice.map((id) => `<@${id}>`),
                    15
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
          new EditPollButton(this.message.id)
            .setLabel(t(this, 'EDIT'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('SECONDARY'),
          new EndPollButton(this.message.id)
            .setLabel(strings.BUTTON_END_POLL)
            .setStyle('DANGER')
            .setEmoji(emojis.buttons.cross),
          new CancelPollButton(this.message.id)
            .setLabel(t(this, 'CANCEL'))
            .setStyle('DANGER')
            .setEmoji(emojis.buttons.trash_bin)
        )
      ),
      ephemeral: true,
    });
  },
});
