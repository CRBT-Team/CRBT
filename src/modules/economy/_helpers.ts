import { Economy } from '@prisma/client';

export function currencyFormat(user: { money: number }, economy: Partial<Economy>) {
  return `${economy.currencySymbol} ${user.money} ${
    user.money === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
  }`;
}
