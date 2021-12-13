import { CRBTError } from '$lib/functions/CRBTError';
import { getVar } from '$lib/functions/getVar';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

const currencies = [
  ['Euro', 'EUR'],
  ['US Dollar', 'USD'],
  ['Australian Dollar', 'AUD'],
  ['Bitcoin', 'BTC'],
  ['British Pound', 'GBP'],
  ['Brazilian Real', 'BRL'],
  ['Canadian Dollar', 'CAD'],
  ['CFA Franc BCEAO', 'XOF'],
  ['Chinese Yuan', 'CNY'],
  ['Ethereum', 'ETH'],
  ['Hong Kong Dollar', 'HKD'],
  ['Japanese Yen', 'JPY'],
  ['North Korean Won', 'KPW'],
  ['South Korean Won', 'KRW'],
  ['Mexican Peso', 'MXN'],
  ['New Zealand Dollar', 'NZD'],
  ['Norwegian Krone', 'NOK'],
  ['Philippine Peso', 'PHP'],
  ['Russian Ruble', 'RUB'],
  ['Swiss Franc', 'CHF'],
  ['Swedish Krona', 'SEK'],
  ['Singapore Dollar', 'SGD'],
  ['Taiwan Dollar', 'TWD'],
].map(([name, value]) => ({ name, value }));

export default ChatCommand({
  name: 'convert',
  description: 'Converts a specified amount from a current to another one.',
  options: new OptionBuilder()
    .number('amount', 'The amount to convert.', true)
    .enum('currency', 'The currency to convert from.', currencies, true)
    .enum('to', 'The currency to convert to.', currencies, true),
  async handle({ amount, currency, to }) {
    const url = `https://api.exchangerate.host/convert?from=${currency}&to=${to}&amount=${amount}&source=${
      ['BTC', 'LTC', 'ETH', 'BCH', 'DOGE'].includes(to) ? 'crypto' : 'ecb'
    }`;

    const res: any = await fetch(url).then((res) => res.json());

    console.log(url);
    console.log(res);

    try {
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${amount} ${
                currencies.find((t) => t.value === currency).name
              } currently exchanges for ${res.result} ${
                currencies.find((t) => t.value === to).name
              }`
            )
            .setColor(`#${await getVar('color', this.user.id)}`),
        ],
      });
    } catch (e) {
      await this.reply(CRBTError(String(e)));
    }
  },
});
