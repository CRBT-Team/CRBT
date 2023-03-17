import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { ButtonComponent } from 'purplet';

export const CancelPollButton = ButtonComponent({
  async handle(msgId: string) {
    try {
      await prisma.poll.delete({
        where: { id: `${this.channel.id}/${msgId}` },
      });

      const msg = await this.channel.messages.fetch(msgId);
      await msg.delete();

      await this.update({
        embeds: [
          {
            title: `${emojis.success} ${t(this, 'poll.strings.SUCCESS_POLL_DELETED')}`,
            color: colors.success,
          },
        ],
        components: [],
      });
    } catch (err) {
      UnknownError(this, err);
    }
  },
});
