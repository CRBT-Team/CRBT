import { CustomEmojiRegex, formatEmojiURL } from '@purplet/utils';
import emojiJSON from '../../../data/misc/emoji.json';
import { emojiImg } from '../../modules/info/emoji info';

export function getEmojiURL(emoji: string): string {
  const regex = CustomEmojiRegex.exec(emoji);

  return regex
    ? formatEmojiURL(regex[0])
    : emojiImg(emojiJSON.find(({ char }) => emoji === char)).Twemoji;
}
