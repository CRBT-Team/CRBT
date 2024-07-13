import { emojis } from '$lib/env';
import { t } from '$lib/language';
import dedent from 'dedent';
import { components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';
import { EconomyCommand, getServerMember, upsertGuildMember } from './_helpers';

export const daily: EconomyCommand = {
  getMeta() {
    return {
      name: 'daily',
      description: 'Come back every day to increase your rewards!',
    };
  },
  async handle() {
    const ONE_DAY = 86400000;
    await this.deferReply();

    const member = await getServerMember(this.user.id, this.guildId);

    if (member?.lastDaily && member.lastDaily.getTime() > Date.now() - ONE_DAY) {
      return this.editReply({
        embeds: [
          {
            title: 'You already claimed your daily reward!',
            description: dedent`
              Come back in **${new Date(member.lastDaily.getTime() + ONE_DAY).toLocaleTimeString(
                this.locale,
              )}** to claim your next reward.
            `,
          },
        ],
      });
    }

    const rawIncome = getPurplets(0);
    const income = (member?.dailyStreak || 0) > 5 ? rawIncome * 1.3 : rawIncome;

    await upsertGuildMember(this, {
      money: income,
      dailyStreak: member?.dailyStreak > 5 ? member?.dailyStreak : 0,
      lastDaily: new Date(),
    });

    await this.editReply({
      embeds: [
        {
          title: 'You claimed your daily reward!',
          description: dedent`
            You earned **${income}** Purplets!
            Come back tomorrow to claim your daily reward (${
              5 - (member?.dailyStreak || 0)
            } days left for a streak bonus!).
          `,
        },
      ],
      components: components(
        row(
          new RemindButton({
            relativetime: Date.now() + ONE_DAY,
            userId: this.user.id,
          })
            .setStyle('SECONDARY')
            .setLabel(t(this, 'SET_REMINDER'))
            .setEmoji(emojis.reminder),
        ),
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
