import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { ButtonComponent } from 'purplet';
import { endPoll } from '../functions/endPoll';
import { getPollData } from '../_helpers';

export const EndPollButton = ButtonComponent({
  async handle(msgId: string) {
    const pollData = await getPollData(`${this.channel.id}/${msgId}`);

    if (pollData) {
      const msg = await this.channel.messages.fetch(msgId);
      await endPoll(pollData, msg);
    }

    await this.update({
      embeds: [
        {
          title: `${emojis.success} ${t(this, 'poll.strings.SUCCESS_POLL_ENDED')}`,
          color: colors.success,
        },
      ],
      components: [],
    });
  },
});
