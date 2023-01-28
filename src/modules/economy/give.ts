import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { getSettings } from '../settings/serverSettings/_helpers';
import { currencyFormat, EconomyCommand } from './_helpers';

export const give: EconomyCommand = {
  getMeta({ plural }) {
    return {
      name: 'give',
      description: `Give ${plural} to another member.`,
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: 'user',
          description: `Who to give ${plural} to.`,
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

    if (target.bot) {
      return CRBTError(this, 'You cannot give Purplets to a bot.');
    }
    if (target.id === this.user.id) {
      return CRBTError(this, 'You cannot give Purplets to yourself.');
    }

    try {
      const { economy } = await getSettings(this.guildId);
      const userData = await prisma.serverMember.findFirst({
        where: {
          AND: { serverId: this.guildId, userId: this.user.id },
        },
        select: { money: true },
      });

      if (!userData || !userData.money || userData.money < amount) {
        return CRBTError(this, {
          title: "You don't have enough Purplets!",
          fields: [
            {
              name: 'Your current balance',
              value: `${economy.currencySymbol} ${userData.money || 0} ${
                userData?.money === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
              }`,
              inline: true,
            },
            {
              name: `${economy.currencyNamePlural} missing`,
              value: `${economy.currencySymbol} ${(userData.money || 0) - amount} ${
                userData?.money === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
              }`,
              inline: true,
            },
          ],
        });
      }

      const targetData = await prisma.serverMember.upsert({
        where: { id: `${target.id}_${this.guildId}` },
        update: { money: { increment: amount } },
        create: {
          id: `${target.id}_${this.guildId}`,
          userId: target.id,
          serverId: this.guildId,
          dailyStreak: 0,
          money: amount,
        },
      });

      const newData = await prisma.serverMember.update({
        data: { money: { decrement: amount } },
        where: { id: `${this.user.id}_${this.guildId}` },
      });

      await this.reply({
        embeds: [
          {
            title: `${emojis.success} Transaction successful!`,
            description: `You successfully gave **${currencyFormat(
              { money: amount },
              economy
            )}** to ${target}.`,
            fields: [
              {
                name: 'Your balance',
                value: `${economy.currencySymbol} ~~${userData.money}~~ **${newData.money} ${
                  newData.money === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
                }**`,
                inline: true,
              },
              {
                name: `${target.username}'s balance`,
                value: `${economy.currencySymbol} ~~${targetData.money - amount}~~ **${
                  targetData.money
                } ${
                  targetData.money === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
                }**`,
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
