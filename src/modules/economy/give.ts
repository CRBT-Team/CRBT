import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getAllLanguages, t } from '$lib/language';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { EconomyCommand, currencyFormat } from './_helpers';

export const give: EconomyCommand = {
  getMeta({ plural }) {
    return {
      name: 'give',
      description: `Give ${plural} to another member.`,
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: 'user',
          description: t('en-US', 'USER_TYPE_COMMAND_OPTION_DESCRIPTION'),
          description_localizations: getAllLanguages('USER_TYPE_COMMAND_OPTION_DESCRIPTION'),
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'amount',
          description: `How many ${plural} to give.`,
          required: true,
          min_value: 1,
        },
      ],
    };
  },
  async handle() {
    const target = this.options.getUser('user');
    const amount = this.options.getInteger('amount');
    const { economy } = await getGuildSettings(this.guildId);

    if (target.bot) {
      return CRBTError(this, `You cannot give ${economy.currencyNamePlural} to a bot.`);
    }
    if (target.id === this.user.id) {
      return CRBTError(this, `You cannot give ${economy.currencyNamePlural} to yourself.`);
    }

    try {
      const userData = await prisma.guildMember.findFirst({
        where: {
          AND: { guildId: this.guildId, userId: this.user.id },
        },
        select: { money: true },
      });

      if (!userData || !userData.money || userData.money < amount) {
        return CRBTError(this, {
          title: `You don't have enough ${economy.currencyNamePlural}.`,
          fields: [
            {
              name: 'Your current balance',
              value: currencyFormat(userData.money, economy, this.locale, {
                zeroEqualsFree: false,
              }),
              inline: true,
            },
            {
              name: `${economy.currencyNamePlural} missing`,
              value: currencyFormat(userData?.money || 0 - amount, economy, this.locale, {
                zeroEqualsFree: false,
              }),
              inline: true,
            },
          ],
        });
      }

      //TODO: update this with the new methods
      const targetData = await prisma.guildMember.upsert({
        where: { id: `${target.id}_${this.guildId}` },
        update: { money: { increment: amount } },
        create: {
          id: `${target.id}_${this.guildId}`,
          userId: target.id,
          guildId: this.guildId,
          dailyStreak: 0,
          money: amount,
        },
      });

      const newData = await prisma.guildMember.update({
        data: { money: { decrement: amount } },
        where: { id: `${this.user.id}_${this.guildId}` },
      });

      await this.reply({
        embeds: [
          {
            title: `${emojis.success} Transaction successful!`,
            fields: [
              {
                name: 'Your balance',
                value: `${economy.currencySymbol} ~~${userData.money}~~ **${currencyFormat(
                  newData.money,
                  economy,
                  this.locale,
                  {
                    zeroEqualsFree: false,
                    withoutSymbol: true,
                  },
                )}**`,
                inline: true,
              },
              {
                name: `${target.username}'s balance`,
                value: `${economy.currencySymbol} ~~${
                  targetData.money - amount
                }~~ **${currencyFormat(targetData.money, economy, this.locale, {
                  zeroEqualsFree: false,
                  withoutSymbol: true,
                })}**`,
                inline: true,
              },
            ],
            color: colors.success,
          },
        ],
      });
    } catch (e) {
      this.reply(UnknownError(this, e));
    }
  },
};
