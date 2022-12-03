import { englishDictionary } from './dictionary';

export function returnFeaturedItem(query: string) {
  query = query.toLowerCase();
  let item = 'web';

  if (englishDictionary.find((word) => word === query)) {
    item = 'dictionary';
  }
  if (query.startsWith('weather') && !!query.replace('weather', '').replace('in', '').trim()) {
    item = 'weather';
  }

  return item;
}
