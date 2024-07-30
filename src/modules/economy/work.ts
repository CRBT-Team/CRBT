import { colors, emojis } from '$lib/env';
import { CooldownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import dedent from 'dedent';
import { components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { EconomyCommand, currencyFormat, getServerMember, upsertGuildMember } from './_helpers';

export const work: EconomyCommand = {
  getMeta({ plural }) {
    return {
      name: 'work',
      description: `Work to earn some ${plural}.`,
    };
  },
  async handle() {
    const memberData = await getServerMember(this.user.id, this.guildId);

    function calculateLevel(workExp?: number) {
      if (!workExp) return 0;

      return Math.round(Math.log(workExp / 100));
    }

    const level = calculateLevel(memberData?.workExp);

    const cooldown = 60 * 1000 * 5 + level * 0.1;
    const lastWork = memberData?.lastWork?.getTime() || Date.now();
    const timeDiff = Date.now() - lastWork;

    if (timeDiff && cooldown > timeDiff) {
      return this.reply(await CooldownError(this, Date.now() + cooldown, true));
    }

    function economyGain() {
      const multiplier = 0.7,
        minAdd = 60,
        maxAdd = 80,
        baseGain = 10;
      const random = Math.floor(Math.random() * (maxAdd - minAdd + 1)) + minAdd;
      const addition = random + level * 0.1;
      const l = addition / (1 - multiplier);
      const timeInDays = timeDiff / 86400000;
      const formula = Math.ceil((baseGain - l) * multiplier ** timeInDays + l);

      console.table({
        random,
        addition,
        l,
        timeInDays,
        timeDiff,
        cmdTime: lastWork,
        formula,
      });

      return formula;
    }

    const income = economyGain();
    const expGain = Math.floor(Math.random() * 100) + 100;
    const { economy } = await getGuildSettings(this.guildId);
    // const possibleStrings = jobStrings[job.type].strings;
    // const string = possibleStrings[Math.floor(Math.random() * possibleStrings.length)];

    console.log({ income, expGain });

    const newData = await upsertGuildMember(
      this,
      {
        money: income,
        workExp: expGain,
        lastWork: new Date(),
      },
      {
        money: { increment: income },
        workExp: { increment: expGain },
        lastWork: new Date(),
      },
    );

    const newLevel = calculateLevel(newData.workExp);

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} You worked...`,
          description: dedent`
          ...and earned **${currencyFormat(income, economy, this.locale)}**!
          `,
          fields: [
            {
              name: 'Experience Points earned',
              value:
                `+${expGain} (${newData.workExp} total, level ${newLevel})` +
                (newLevel > level ? ` **[LEVEL UP!]**` : ''),
            },
          ],
          footer: {
            text: 'Use the button below to know when you can work again as early as possible.',
          },
          color: colors.success,
        },
      ],
      components: components(
        row(
          new RemindButton({
            relativetime: Date.now() + cooldown,
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
