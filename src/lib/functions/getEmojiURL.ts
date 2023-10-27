import { CustomEmojiRegex, formatEmojiURL } from '@purplet/utils';
import emojiJSON from '../../../static/misc/emoji.json';
import { emojiImg } from '../../modules/info/emoji info';
import { getEmojiObject } from './getEmojiObject';

export function getEmojiURL(emoji: string): string {
  const regex = emoji.match(CustomEmojiRegex);

  return regex
    ? formatEmojiURL(getEmojiObject(emoji).id)
    : emojiImg(emojiJSON.find(({ char }) => emoji === char))['Twitter / X'];
}
