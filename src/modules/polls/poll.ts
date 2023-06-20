import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { fetchWithCache } from '$lib/cache';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { findEmojis } from '$lib/functions/findEmojis';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { getAllLanguages, t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { CustomEmojiRegex, timestampMention } from '@purplet/utils';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import { PollMenuButton } from './components/PollMenuButton';
import { VoteButton } from './components/VoteButton';
import { renderPoll } from './functions/renderPoll';

const options = new OptionBuilder()
  .string('title', t('en-US', 'poll.meta.options.title.description'), {
    nameLocalizations: getAllLanguages('TITLE', localeLower),
    descriptionLocalizations: getAllLanguages('poll.meta.options.title.description'),
    required: true,
    minLength: 3,
    maxLength: 120,
  })
  .string('end_date', t('en-US', 'poll.meta.options.end_date.description'), {
    nameLocalizations: getAllLanguages('END_DATE', localeLower),
    descriptionLocalizations: getAllLanguages('poll.meta.options.end_date.description'),
    autocomplete({ end_date }) {
      return timeAutocomplete.call(this, end_date, '3w', '20m');
    },
    required: true,
  });

for (let i = 1; i <= 4; i++) {
  options.string(`choice${i}`, t('en-US', 'poll.meta.options.choice.description'), {
    nameLocalizations: getAllLanguages(
      'CHOICE',
      (str, locale) => `${localeLower(str, locale)}${i}`
    ),
    descriptionLocalizations: getAllLanguages('poll.meta.options.choice.description'),
    maxLength: 45,
    required: i <= 2,
  });
}

//TODO: make this real
// options.attachment(
//   'image',
//   t('en-US', 'poll.meta.options.multichoice.description', {
//     nameLocalizations: getAllLanguages('IMAGE', (str, locale) => localeLower(str, locale)),
//     descriptionLocalizations: getAllLanguages('poll.meta.options.multichoice.description'),
//   })
// );

export default ChatCommand({
  name: 'poll',
  description: t('en-US', 'poll.meta.description'),
  nameLocalizations: getAllLanguages('POLL', localeLower),
  descriptionLocalizations: getAllLanguages('poll.meta.description'),
  allowInDMs: false,
  options,
  // async handle({ title, end_date, choice1, choice2, choice3, choice4, image: untypedImage }) {
  async handle({ title, end_date, choice1, choice2, choice3, choice4 }) {
    // let image = untypedImage as MessageAttachment;
    if (!isValidTime(end_date) && ms(end_date) > ms('3w')) {
      return CRBTError(
        this,
        t(this, 'ERROR_INVALID_DURATION', {
          relativeTime: '3 weeks',
        })
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    try {
      const pollChoices: string[] = [choice1, choice2, choice3, choice4].filter(Boolean);

      for (const choice of pollChoices) {
        if (choice.replace(CustomEmojiRegex, '').trim().length === 0) {
          return CRBTError(this, t(this, 'poll.errors.CHOICE_EMPTY'));
        }
      }

      const pollData = {
        expiresAt: new Date(Date.now() + ms(end_date)),
        locale: this.guildLocale,
        creatorId: this.user.id,
        serverId: this.guild.id,
        choices: pollChoices.map((_) => []),
      };

      const msg = await this.channel.send({
        ...(await renderPoll.call(this, pollData, null, {
          title,
          choices: pollChoices,
        })),
        components: components(
          row().addComponents([
            ...pollChoices.map((choice, index) => {
              const choiceEmoji = findEmojis(choice)[0] || null;
              const choiceText = choice.replace(CustomEmojiRegex, '');

              return new VoteButton({ choiceId: index.toString() })
                .setLabel(choiceText)
                .setStyle('PRIMARY')
                .setEmoji(choiceEmoji);
            }),
            new PollMenuButton(this.user.id).setEmoji(emojis.buttons.menu).setStyle('SECONDARY'),
          ])
        ),
      });

      await fetchWithCache(
        `poll:${this.channel.id}/${msg.id}`,
        () =>
          dbTimeout(TimeoutTypes.Poll, {
            id: `${this.channel.id}/${msg.id}`,
            ...pollData,
          }),
        true
      );

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} ${t(this, 'poll.strings.SUCCESS_TITLE')}`,
            description: t(this, 'poll.strings.SUCCESS_DESCRIPTION', {
              TIME: timestampMention(Date.now() + ms(end_date), 'R'),
              ICON: emojis.menu,
            }),
            color: colors.success,
          },
        ],
      });
    } catch (error) {
      (this.replied ? this.reply : this.editReply)(UnknownError(this, String(error)));
    }
  },
});
