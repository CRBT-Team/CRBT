import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { capitalCase } from 'change-case-all';
import convert, { Unit } from 'convert-units';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { fetch } from 'undici';
import Currencies from '../../../static/misc/currencies.json';

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
  description: 'Convert two units of measure.',
  options: new OptionBuilder()
    .number('amount', 'The amount to convert.', { required: true })
    .string('from', 'The unit to convert from.', {
      nameLocalizations: getAllLanguages('FROM', localeLower),
      autocomplete({ from }) {
        from = from?.toLowerCase();
        const filtered = allUnits.filter(
          ({ measure, abbr, singular, plural }) =>
            measure.includes(from) ||
            abbr.toLowerCase() === from ||
            singular.toLowerCase().includes(from) ||
            plural.toLowerCase().includes(from),
        );
        return filtered.map(({ measure, singular: name, abbr }) => ({
          name: `${capitalCase(measure)} - ${name}`,
          value: abbr,
        }));
      },
      required: true,
    })
    .string('to', 'The unit to convert to.', {
      nameLocalizations: getAllLanguages('TO', localeLower),
      autocomplete({ from, to }) {
        const fromType = allUnits.find(({ abbr }) => abbr === from)?.measure;

        to = to?.toLowerCase();
        const filtered = allUnits
          .filter(({ abbr, measure }) => (from ? measure === fromType && abbr !== from : true))
          .filter(
            ({ singular, plural }) =>
              singular.toLowerCase().includes(to) || plural.toLowerCase().includes(to),
          );

        return filtered.map(({ measure, singular: name, abbr }) => ({
          name: `${capitalCase(measure)} - ${name}`,
          value: abbr,
        }));
      },
      required: true,
    }),
  async handle({ amount, from, to }) {
    if (allUnits.find(({ abbr }) => abbr === from) === undefined) {
      return CRBTError(
        this,
        `"${from}" is not a valid unit. Choose valid units from the autocomplete.`,
      );
    }
    if (allUnits.find(({ abbr }) => abbr === to) === undefined) {
      return CRBTError(
        this,
        `"${to}" is not a valid unit. Choose valid units from the autocomplete.`,
      );
    }

    if (
      currencies.find(({ abbr }) => abbr === from) !== undefined &&
      currencies.find(({ abbr }) => abbr === to) !== undefined
    ) {
      try {
        const res: any = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/pair/${from}/${to}/${amount}`,
        ).then((res) => res.json());

        const result = Number(res.conversion_result).toFixed(2);
        const lastUpdate = new Date(res.time_last_update_unix * 1000);

        const baseCurrency = currencies.find(({ abbr }) => abbr === from).singular;
        const targetCurrency = currencies.find(({ abbr }) => abbr === to).singular;

        await this.reply({
          embeds: [
            {
              author: {
                name: `${amount.toLocaleString(this.locale)} ${baseCurrency} currently exchanges for`,
              },
              title: `${result.toLocaleLowerCase(this.locale)} ${targetCurrency}`,
              footer: {
                text: `${t(this, 'POWERED_BY', {
                  provider: 'exchangerate-api.com',
                })} • Last updated ${lastUpdate.toLocaleString(this.locale)}`,
              },
              color: await getColor(this.user),
            },
          ],
        });
      } catch (error) {
        await this.reply(UnknownError(this, error));
      }
    } else if (
      units.find(({ abbr }) => abbr === from).measure !==
      units.find(({ abbr }) => abbr === to).measure
    ) {
      return CRBTError(
        this,
        `Both of the units must be of the same type (e.g. length, mass, etc.)`,
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
