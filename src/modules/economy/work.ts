import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CooldownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import dedent from 'dedent';
import { components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { EconomyCommand, currencyFormat, upsertGuildMember } from './_helpers';

export const work: EconomyCommand = {
  getMeta({ plural }) {
    return {
      name: 'work',
      description: `Work to earn some ${plural}.`,
    };
  },
  async handle() {
    const userData = await prisma.guildMember.findFirst({
      where: {
        AND: {
          userId: this.user.id,
          guildId: this.guildId,
        },
      },
      select: { workExp: true, lastWork: true },
    });

    const level = userData?.workExp ? Math.round(Math.log(userData?.workExp / 100)) : 0;

    const cooldown = 60 * 1000 * 5 + level * 0.1;
    const lastWork = (userData?.lastWork?.getTime() || Date.now()) - cooldown;
    const timeDiff = Date.now() - lastWork;

    if (timeDiff && timeDiff < cooldown) {
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
        workExp: { increment: expGain },
        money: { increment: income },
        lastWork: new Date(),
      },
    );

    const newLevel = Math.round(Math.log(newData.workExp / 100));

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} You worked...`,
          description: dedent`
          ...and earned **${currencyFormat(income, economy, this.locale)}**!
          `,
          fields: [
            {
              name: 'EXP',
              value: `+${expGain} (${newData.workExp} total, level ${newLevel})`,
            },
          ],
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
