import dayjs from 'dayjs';
import relative from 'dayjs/plugin/relativeTime.js';
import { AutocompleteInteraction } from 'discord.js';
import { Choice } from 'purplet';
import { ms } from './ms';
import { resolveToDate } from './resolveToDate';

dayjs.extend(relative);

export async function timeAutocomplete(
  duration: string,
  ctx: AutocompleteInteraction,
  max: string = '3y',
  min: string = '5s'
): Promise<Choice<string>[]> {
  const locale = ctx.locale.split('-')[0];
  await import(`dayjs/locale/${locale}.js`);
  const now = dayjs().locale(locale);

  if (!duration || duration.length <= 4) {
    return (
      [
        ['20m', now.add(20, 'm')],
        ['1h', now.add(1, 'h')],
        ['24h', now.add(1, 'd')],
        ['3d', now.add(3, 'd')],
        ['1w', now.add(1, 'w')],
        ['2w', now.add(2, 'w')],
        ['1M', now.add(1, 'M')],
        [max, now.add(ms(max))],
      ] as [string, dayjs.Dayjs][]
    )
      .filter(([, date]) => date.isBefore(now.add(ms(max))) && date.isAfter(now.add(ms(min))))
      .map(([value, name]) => ({ name: name.fromNow(), value }));
  }

  try {
    const relative = await resolveToDate(duration, locale);
    console.log(relative);

    if (relative.isAfter(now.add(ms(max))))
      throw new Error(`Duration cannot be longer than ${max} in the future`);

    if (relative.isBefore(now.add(ms(min))))
      throw new Error(`Duration cannot be shorter than ${min} in the past`);

    return [
      {
        name:
          relative.diff(now) > ms('1 day')
            ? `${relative.fromNow()} - ${relative.format('YYYY-MM-DD HH:mm:ss')}`
            : relative.fromNow(),
        value: duration,
      },
    ];
  } catch (e) {
    return [
      {
        name: String(e),
        value: 'ERROR',
      },
    ];
  }
}
