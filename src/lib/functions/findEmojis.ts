import { CustomEmojiRegex } from '@purplet/utils';

export function findEmojis(str: string) {
  const customMatches = str.match(CustomEmojiRegex) || [];
  return customMatches;
}
