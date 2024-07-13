import emojiJSON from '../../../static/misc/emoji.json';
import { CustomEmojiRegex } from '@purplet/utils';

export function findEmojis(str: string) {
  const customMatches = str.match(CustomEmojiRegex) || emojiJSON.filter(({ char }) => str.includes(char)).map(({ char }) => char);
  return customMatches;
}
