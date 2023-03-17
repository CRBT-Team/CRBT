import { t } from '$lib/language';

export function trimArray(arr: string[], locale: string, max: number = 10) {
  if (arr.length > max) {
    const len = arr.length - max;
    arr = arr.slice(0, max);
    arr.push(t(locale, 'MORE_ELEMENTS', { number: len.toLocaleString(locale) }));
  }
  return arr;
}
