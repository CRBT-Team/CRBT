import { Dayjs } from 'dayjs';

type Suffixes = 'D' | 'T' | 'R';

export function time(date: Date | Dayjs, type?: Suffixes | true) {
  const suffix = type === true ? ':R' : type ? `:${type}` : '';

  if (date instanceof Date) {
    return `<t:${date.getTime() / 1000}${suffix}>`;
  }

  return `<t:${date.unix()}${suffix}>`;
}
