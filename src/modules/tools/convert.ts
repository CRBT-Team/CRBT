import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { capitalCase } from 'change-case';
import convert, { Unit } from 'convert-units';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';
import Currencies from '../../../data/misc/currencies.json';

const units = convert().list();
const currencies = Object.entries(Currencies).map(([_, { code, name, name_plural }]) => ({
  abbr: code,
  measure: 'currency',
  singular: name,
  plural: name_plural,
}));

const allUnits = [...currencies, ...units] as {
  abbr: string;
  measure: convert.Measure | 'currency';
  singular: string;
  plural: string;
}[];

export default ChatCommand({
  name: 'convert',
  description: 'Convert a specified amount from any unit to another.',
  options: new OptionBuilder()
    .number('amount', 'The amount to convert.', { required: true })
    .string('from', 'The unit to convert from.', {
      autocomplete({ from }) {
        from = from?.toLowerCase();
        const filtered = allUnits.filter(
          ({ measure, abbr, singular, plural }) =>
            measure.includes(from) ||
            abbr.toLowerCase() === from ||
            singular.toLowerCase().includes(from) ||
            plural.toLowerCase().includes(from)
        );
        return filtered.map(({ measure, singular: name, abbr }) => ({
          name: `${capitalCase(measure)} - ${name}`,
          value: abbr,
        }));
      },
      required: true,
    })
    .string('to', 'The unit to convert to.', {
      autocomplete({ from, to }) {
        const fromType = allUnits.find(({ abbr }) => abbr === from)?.measure;
        console.log(fromType);
        to = to?.toLowerCase();
        const filtered = allUnits
          .filter(({ abbr, measure }) => (from ? measure === fromType && abbr !== from : true))
          .filter(
            ({ singular, plural }) =>
              singular.toLowerCase().includes(to) || plural.toLowerCase().includes(to)
          );
        console.log(filtered.length);
        return filtered.map(({ measure, singular: name, abbr }) => ({
          name: `${capitalCase(measure)} - ${name}`,
          value: abbr,
        }));
      },
      required: true,
    }),
  async handle({ amount, from, to }) {
    if (allUnits.find(({ abbr }) => abbr === from) === undefined) {
      return CRBTError(this,
        `"${from}" is not a valid unit. Please use the autocomplete to select a valid unit.`
      )

    }
    if (allUnits.find(({ abbr }) => abbr === to) === undefined) {
      return CRBTError(this,
        `"${to}" is not a valid unit. Please use the autocomplete to select a valid unit.`
      )

    }

    if (
      currencies.find(({ abbr }) => abbr === from) !== undefined &&
      currencies.find(({ abbr }) => abbr === to) !== undefined
    ) {
      try {
        const { result, date } = (await fetch(
          `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`
        ).then((res) => res.json())) as any;

        from = currencies.find(({ abbr }) => abbr === from).singular;
        to = currencies.find(({ abbr }) => abbr === to).singular;

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
      return CRBTError(this, `Both of the units must be of the same type (e.g. length, mass, etc.)`)
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
