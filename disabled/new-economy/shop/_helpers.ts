import { Economy, EconomyItem } from '@prisma/client';
import dedent from 'dedent';
import { EmbedFieldData } from 'discord.js';
import { currencyFormat, formatItemValue } from '../_helpers';

export function renderItemEmbedField(
  item: EconomyItem,
  economy: Partial<Economy>,
  locale: string
): EmbedFieldData {
  return {
    name: `${item.icon} ${item.name}`,
    value: dedent`
      ${formatItemValue(item.type, item.value)}
      ${currencyFormat(item.price, economy, locale)}
    `,
  };
}
