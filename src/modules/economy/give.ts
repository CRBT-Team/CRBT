import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { ChatCommand, OptionBuilder } from 'purplet';
import { getSettings } from '../settings/serverSettings/_helpers';
import { currencyFormat } from './_helpers';

export default ChatCommand({
  name: 'give',
  description: 'Give a given amount of your Purplets to a user.',
  options: new OptionBuilder()
    .user('user', 'The user to give your Purplets to.', { required: true })
    .integer('amount', 'The amount of Purplets you want to give.', {
      minValue: 1,
      required: true,
    }),
  async handle({ user: target, amount }) {
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
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});
