import { Dayjs } from 'dayjs';

export function unix(date: Date | Dayjs, relative = false) {
  if (date instanceof Date) {
    return `<t:${date.getTime() / 1000}${relative ? ':R' : ''}>`;
  }

  return `<t:${date.unix()}${relative ? ':R' : ''}>`;
}
