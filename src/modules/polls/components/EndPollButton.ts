import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { ButtonComponent } from 'purplet';
import { getPollData } from '../_helpers';
import { endPoll } from '../functions/endPoll';

export const EndPollButton = ButtonComponent({
  async handle(msgId: string) {
    const pollData = await getPollData(this.channel.id, msgId);

    await this.deferUpdate();

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
