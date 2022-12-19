import { Economy } from '@prisma/client';

export function currencyFormat(
  user: { money: number },
  economy: Partial<Economy>,
  locale = 'en-US'
) {
  return `${economy.currencySymbol} ${user.money.toLocaleString(locale)} ${
    user.money === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
  }`;
}