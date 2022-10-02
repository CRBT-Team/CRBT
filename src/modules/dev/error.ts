import { CooldownError, CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { AchievementProgress } from '$lib/responses/Achievements';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
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
  async handle({ type, error, details }) {
    switch (type) {
      case 'formatted': {
        await CRBTError(this, {
          title: error,
          description: details
        });
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
