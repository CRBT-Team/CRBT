import { CooldownError, CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { AchievementProgress } from '$lib/responses/Achievements';
import { ChatCommand, OptionBuilder, TextCommand } from 'purplet';

export const text = TextCommand({
  name: 'error',
  handle(args) {
    this.reply(UnknownError(this, args.join(' '), 'INTENTIONAL_ERROR', false));
  },
});

export const slash = ChatCommand({
  name: 'error',
  description:
    'Send an error message to the developers. For debugging purposes, or to send me a message :)',
  options: new OptionBuilder()
    .string('type', 'The type of error message', {
      choices: {
        formatted: 'CRBTError',
        unknown: 'UnknownError',
        cooldown: 'CooldownError',
      },
      required: true,
    })
    .string('error', 'The error message to send', {
      required: true,
    })
    .string('details', 'The details of the error message'),
  async handle({ type, error }) {
    switch (type) {
      case 'formatted': {
        await this.reply(CRBTError(error));
        break;
      }
      case 'unknown': {
        await this.reply(UnknownError(this, error));
        break;
      }
      case 'cooldown': {
        await this.reply(await CooldownError(this, Date.now() + 30000, false));
        break;
      }
    }

    await AchievementProgress.call(this, 'ERROR_MASTER');
  },
});
