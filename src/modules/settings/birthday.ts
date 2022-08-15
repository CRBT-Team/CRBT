import { dateAutocomplete } from '$lib/autocomplete/dateAutocomplete';
import { db } from '$lib/db';
import { time } from '$lib/functions/time';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'birthday set',
  description: "Set your CRBT account's birthday (shown in User Info).",
  options: new OptionBuilder().string('date', 'The date to set as your birthday.', {
    required: true,
    autocomplete({ date }) {
      return dateAutocomplete.call(this, date);
    },
  }),
  async handle({ date }) {
    await this.deferReply();

    const birthday = new Date(date);

    await db.users.upsert({
      where: { id: this.user.id },
      create: {
        id: this.user.id,
        birthday,
      },
      update: {
        birthday,
      },
    });

    await this.editReply(`${time(birthday, 'D')}`);
  },
});
