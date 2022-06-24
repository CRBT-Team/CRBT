import { t } from '$lib/language';
import dayjs from 'dayjs';
import { isValidTime, ms } from './ms';

const convertTime12to24 = (time12h: string) => {
  const [time, modifier] = time12h.toLowerCase().split(/ |p|a/);

  let [hours, minutes]: (string | number)[] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (time12h.toLowerCase().endsWith('pm')) {
    hours = parseInt(hours, 10) + 12;
  }

  return minutes ? `${hours}:${minutes}` : `${hours}:00`;
};

export async function resolveToDate(
  when: Date | string | dayjs.Dayjs | number,
  locale = 'en'
): Promise<dayjs.Dayjs> {
  const { keywordsDetection__KEEPLOWERCASE: keywords } = t(locale, 'remind me');

  locale = locale.split('-')[0];
  await import(`dayjs/locale/${locale}.js`);
  const now = dayjs().locale(locale);

  // if it's a date, dayjs-ify it
  if (when instanceof Date) return dayjs(when);
  // if it's a dayjs, return it
  if (dayjs.isDayjs(when)) return when;

  if (typeof when === 'number') {
    // if the number is a timestamp, dayjs-ify it
    if (now.isBefore(when)) return dayjs(when);
    else return dayjs().add(when, 'ms');
  }
  const raw = when;

  when = when
    .trim()
    .replaceAll(`${keywords.AND} `, '')
    .replaceAll(`${keywords.AT} `, '')
    .replaceAll(`${keywords.ON} `, '')
    .replaceAll(`${keywords.IN} `, '')
    .replaceAll('  ', ' ')
    .trim();

  // console.log(when);

  if (isValidTime(when)) {
    return now.add(ms(when));
  }

  if (when.startsWith(keywords.TODAY) || raw.startsWith(keywords.AT)) {
    const time = when.split(' ').length === 1 ? null : when.split(' ').slice(1).join('');

    // console.log(time);

    return time
      ? dayjs(`${now.format('YYYY-MM-DD')}T${convertTime12to24(time)}Z`)
      : now.add(30, 'm');
  }

  if (when.startsWith(keywords.TOMORROW)) {
    const tomorrow = now.add(1, 'day');
    const time = when.split(' ').length === 1 ? null : when.split(' ').slice(1).join('');

    return !!time
      ? dayjs(`${tomorrow.format('YYYY-MM-DD')}T${convertTime12to24(time)}Z`)
      : tomorrow;
  }

  if (dayjs(when).isValid()) {
    if (dayjs(when).isAfter(now)) {
      return dayjs(when);
    } else {
      throw new Error('Date cannot be in the past');
    }
  }

  throw new Error('Invalid date format');
  // return time ? now.set('h', convertTime12to24(time)) : now;
  // }
  // if (dayjs(when).isValid()) {
  // }
}
