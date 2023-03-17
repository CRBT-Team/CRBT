import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';
import { EconomyCommand, upsertServerMember } from './_helpers';

export const daily: EconomyCommand = {
  getMeta() {
    return {
      name: 'daily',
      description: 'Come back every day to increase your rewards!',
    };
  },
  async handle() {
    await this.deferReply();

    const currentStreak =
      ((
        await prisma.serverMember.findFirst({
          where: {
            AND: {
              userId: this.user.id,
              serverId: this.guildId,
            },
          },
        })
      )?.dailyStreak ?? 0) + 1;

    const rawIncome = getPurplets(0);
    const income = currentStreak > 5 ? rawIncome * 1.3 : rawIncome;

    await upsertServerMember(this, {
      money: income,
      dailyStreak: currentStreak + 1,
      lastDaily: new Date(),
    });

    await this.editReply({
      embeds: [],
      components: components(
        row(
          new RemindButton({
            relativetime: Date.now() + 3.6e6,
            userId: this.user.id,
          })
            .setStyle('SECONDARY')
            .setLabel(t(this, 'SET_REMINDER'))
            .setEmoji(emojis.reminder)
        )
      ),
    });
  },
};

function getPurplets(n: number) {
  if (n > 20000) {
    return Math.floor(Math.random() * (0 - 20 + 1) + 0);
    // return { range: [0, 20], out: Math.floor(Math.random() * (0 - 20 + 1) + 0) };
  }
  const max = Math.floor(-0.004 * n + 100);
  const min = max - 20;
  const rand = Math.floor(Math.random() * (max - min + 1)) + min;
  return rand;
  // return { range: [min, max], out: rand };
}
