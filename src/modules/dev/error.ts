import { UnknownError } from '$lib/functions/CRBTError';
import { ChatCommand, OptionBuilder, TextCommand } from 'purplet';

export const text = TextCommand({
  name: 'error',
  handle(args) {
    this.reply(UnknownError(this, args.join(' '), 'INTENTIONAL_ERROR', false));
  },
});

export const slash = ChatCommand({
  name: 'error',
  description: 'Send an error message to the developers',
  options: new OptionBuilder().string('error', 'The error message'),
  handle({ error }) {
    this.reply(UnknownError(this, error, 'INTENTIONAL_ERROR', false));
  },
});
