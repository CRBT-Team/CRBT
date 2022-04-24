import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import convert, { Unit } from 'convert-units';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

const units = convert().list();
const currencies = [
  ['Euro', 'EUR'],
  ['US Dollar', 'USD'],
  ['Australian Dollar', 'AUD'],
  ['Bitcoin', 'BTC'],
  ['British Pound', 'GBP'],
  ['Canadian Dollar', 'CAD'],
  ['Chinese Yuan', 'CNY'],
  ['Dogecoin', 'DOGE'],
  ['Ethereum', 'ETH'],
  ['Brazilian Real', 'BRL'],
  ['Bitcoin Cash', 'BCH'],
  ['Binance Coin', 'BNB'],
  ['CFA Franc BCEAO', 'XOF'],
  ['Hong Kong Dollar', 'HKD'],
  ['Japanese Yen', 'JPY'],
  ['Litecoin', 'LTC'],
  ['Mexican Peso', 'MXN'],
  ['New Zealand Dollar', 'NZD'],
  ['Norwegian Krone', 'NOK'],
  ['North Korean Won', 'KPW'],
  ['Philippine Peso', 'PHP'],
  ['Russian Ruble', 'RUB'],
  ['Singapore Dollar', 'SGD'],
  ['South Korean Won', 'KRW'],
  ['Swedish Krona', 'SEK'],
  ['Swiss Franc', 'CHF'],
  ['Taiwan Dollar', 'TWD'],
  ['Polish Złoty', 'PLN'],
  ['South African Rand', 'ZAR'],
].map(([name, value]) => ({ name, value }));

const allUnits = [
  ...currencies,
  ...units.map(({ abbr, plural }) => ({ name: plural, value: abbr })),
].sort(() => Math.random() - 0.5);

export default ChatCommand({
  name: 'convert',
  description: 'Convert a specified amount from any unit to another.',
  options: new OptionBuilder()
    .number('amount', 'The amount to convert.', true)
    .string('from', 'The unit to convert from.', true)
    .autocomplete('from', ({ from }) => {
      return allUnits.filter((unit) => unit.name.toLowerCase().includes(from.toLowerCase()));
    })
    .string('to', 'The unit to convert to.', true)
    .autocomplete('to', ({ to }) => {
      return allUnits.filter((unit) => unit.name.toLowerCase().includes(to.toLowerCase()));
    }),
  async handle({ amount, from, to }) {
    if (allUnits.find(({ value }) => value === from) === undefined) {
      return this.reply(
        CRBTError(
          `"${from}" is not a valid unit. Please use the autocomplete to select a valid unit.`
        )
      );
    }
    if (allUnits.find(({ value }) => value === to) === undefined) {
      return this.reply(
        CRBTError(
          `"${to}" is not a valid unit. Please use the autocomplete to select a valid unit.`
        )
      );
    }

    if (
      currencies.find(({ value }) => value === from) !== undefined &&
      currencies.find(({ value }) => value === to) !== undefined
    ) {
      try {
        const { result, date } = (await fetch(
          `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`
        ).then((res) => res.json())) as any;

        from = currencies.find(({ value }) => value === from).name;
        to = currencies.find(({ value }) => value === to).name;

        await this.reply({
          embeds: [
            new MessageEmbed()
              .setAuthor({ name: `${amount} ${from} currently exchanges for` })
              .setTitle(`${result} ${to}`)
              .setFooter({
                text: `Data may be inaccurate.\nSource: exchangerate.host • Last updated ${date}`,
              })
              .setColor(await getColor(this.user)),
          ],
        });
      } catch (error) {
        await this.reply(UnknownError(this, error));
      }
    } else if (
      units.find(({ abbr }) => abbr === from).measure !==
      units.find(({ abbr }) => abbr === to).measure
    ) {
      return this.reply(
        CRBTError(`Both of the units must be of the same type (e.g. length, mass, etc.)`)
      );
    } else {
      try {
        const result = convert(amount)
          .from(from as Unit)
          .to(to as Unit);

        from = units.find(({ abbr }) => abbr === from)[amount === 1 ? 'singular' : 'plural'];
        to = units.find(({ abbr }) => abbr === to)[amount === 1 ? 'singular' : 'plural'];
        await this.reply({
          embeds: [
            new MessageEmbed()
              .setAuthor({ name: `${amount} ${from} converts to` })
              .setTitle(`${result} ${to}`)
              .setColor(await getColor(this.user)),
          ],
        });
      } catch (error) {
        await this.reply(UnknownError(this, error));
      }
    }
  },
});
