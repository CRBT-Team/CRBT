import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { findEmojis } from '$lib/functions/findEmojis';
import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { getAllLanguages, t } from '$lib/language';
import { CustomEmojiRegex } from '@purplet/utils';
import { ChatCommand, OptionBuilder } from 'purplet';
import { fetch } from 'undici';

const options = new OptionBuilder()
  .string('title', t('en-US', 'poll.meta.options.title.description'), {
    nameLocalizations: getAllLanguages('QUESTION', localeLower),
    descriptionLocalizations: getAllLanguages('poll.meta.options.title.description'),
    required: true,
    minLength: 1,
    maxLength: 300,
  })
  .string('end_date', t('en-US', 'poll.meta.options.end_date.description'), {
    nameLocalizations: getAllLanguages('END_DATE', localeLower),
    descriptionLocalizations: getAllLanguages('poll.meta.options.end_date.description'),
    choices: {
      ['1h']: '1 hour',
      ['2h']: '2 hours',
      ['3h']: '3 hours',
      ['4h']: '4 hours',
      ['5h']: '5 hours',
      ['6h']: '6 hours',
      ['7h']: '7 hours',
      ['8h']: '8 hours',
      ['9h']: '9 hours',
      ['10h']: '10 hours',
      ['11h']: '11 hours',
      ['12h']: '12 hours',
      ['1d']: '1 day',
      ['2d']: '2 days',
      ['3d']: '3 days',
      ['4d']: '4 days',
      ['5d']: '5 days',
      ['6d']: '6 days',
      ['7d']: '1 week',
    },
    required: true,
  })
  .boolean('multiple_choices', 'Allow multiple choices.', {
    // nameLocalizations: getAllLanguages('MULTICHOICE', localeLower),
    // descriptionLocalizations: getAllLanguages('poll.meta.options.multichoice.description'),
    required: true,
  });

for (let i = 1; i <= 10; i++) {
  options.string(`answer${i}`, t('en-US', 'poll.meta.options.choice.description'), {
    nameLocalizations: getAllLanguages(
      'ANSWER',
      (str, locale) => `${localeLower(str, locale)}${i}`,
    ),
    descriptionLocalizations: getAllLanguages('poll.meta.options.choice.description'),
    maxLength: 55,
    required: i <= 1,
  });
}

export default ChatCommand({
  name: 'poll',
  description: t('en-US', 'poll.meta.description'),
  nameLocalizations: getAllLanguages('POLL', localeLower),
  descriptionLocalizations: getAllLanguages('poll.meta.description'),
  allowInDMs: false,
  options,
  async handle({ title, end_date, multiple_choices, ...choicesRaw }) {
    const choices: string[] = Object.values(choicesRaw).filter(Boolean);

    if (!isValidTime(end_date) && ms(end_date) > ms('7d')) {
      return CRBTError(
        this,
        t(this, 'ERROR_INVALID_DURATION', {
          relativeTime: '7 days',
        }),
      );
    }

    for (const choice of choices) {
      if (choice.replace(CustomEmojiRegex, '').trim().length === 0) {
        return CRBTError(this, t(this, 'poll.errors.CHOICE_EMPTY'));
      }
    }

    const guildEmojis = (await this.guild.fetch()).emojis;

    const answers = choices.map((choice) => {
      const choiceEmoji = findEmojis(choice)[0] || '';
      const choiceText = choice.replace(choiceEmoji, '');
      const isCustomEmoji = CustomEmojiRegex.test(choiceEmoji);
      const { id } = getEmojiObject(choiceEmoji);
      const isGuildEmoji = guildEmojis.cache.has(id);

      return {
        poll_media: {
          text: choiceText.trim(),
          ...(
            choiceEmoji
            ? isCustomEmoji && !isGuildEmoji 
              ? {} 
              : { 
                  emoji: isCustomEmoji 
                  ? { id }
                  : { name: choiceEmoji },
                }
            : {}
          ),
        }
      }
    });


    for (const emoji of answers.map(({ poll_media }) => poll_media.emoji?.id)) {
      if (emoji && !guildEmojis.fetch(emoji)) {
        return CRBTError(
          this,
          'You can only use emojis from this server.'
        );
      }
    }

    try {
      await fetch(`https://discord.com/api/v10/interactions/${this.id}/${this.token}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
        body: JSON.stringify({
          type: 4,
          data: {
            poll: {
              question: {
                text: title,
              },
              answers,
              duration: (ms(end_date) / 1000 / 60 / 60).toFixed(0),
              allow_multiselect: multiple_choices,
            }
          }
        })
      });
    } catch (e) {
      return UnknownError(this, String(e));
    }
    return;
  },
});
