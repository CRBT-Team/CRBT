import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import dedent from 'dedent';
import { components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';
import { currencyFormat, EconomyCommand, getServerMember, upsertGuildMember } from './_helpers';
import { timestampMention } from '@purplet/utils';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { createCRBTError } from '$lib/functions/CRBTError';

export const daily: EconomyCommand = {
  getMeta({ plural }) {
    return {
      name: 'daily',
      description: `Claim free ${plural} every day and increase your streak!`,
    };
  },
  async handle() {
    const ONE_DAY = 86400000;

    const member = await getServerMember(this.user.id, this.guildId);
    const { economy } = await getGuildSettings(this.guildId);

    if (member?.lastDaily && member.lastDaily.getTime() > Date.now() - ONE_DAY) {
      return this.reply(
        createCRBTError(this, {
          title: `${emojis.error} You already claimed your daily reward!`,
          description: dedent`
              Come back **${timestampMention(
                member.lastDaily.getTime() + ONE_DAY,
                'R',
              )}** to claim your next reward.
            `,
          color: colors.error,
        }),
      );
    }

    await this.deferReply();

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

    const rawIncome = getPurplets(0);
    const streak = member?.dailyStreak || 0;
    const hasBonus = streak === 6;
    const income = hasBonus ? rawIncome * 1.3 : rawIncome;

    await upsertGuildMember(
      this,
      {
        money: income,
        dailyStreak: !hasBonus ? streak + 1 : 0,
        lastDaily: new Date(),
      },
      {
        money: { increment: income },
        dailyStreak: !hasBonus ? 1 : 0,
        lastDaily: new Date(),
      },
    );

    await this.editReply({
      embeds: [
        {
          title: `${emojis.success} Daily reward claimed!`,
          description:
            dedent`
            You earned **${currencyFormat(income, economy, this.locale)}**! ${hasBonus ? '(+30% 7-day streak bonus!)' : ''}
            Come back in 24 hours to claim your next daily reward.` +
            (hasBonus ? ` (Streak reset!)` : ` (${6 - streak} day(s) left for a streak bonus!)`),
          color: colors.success,
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
