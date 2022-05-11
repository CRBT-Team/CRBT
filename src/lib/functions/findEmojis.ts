import { EmojiRegex } from '../util/regex';

export function findEmojis(str: string) {
  const customMatches = str.match(EmojiRegex) || [];
  return customMatches;
}
