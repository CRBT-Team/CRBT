import { CustomEmojiRegex } from '@purplet/utils';
import { APIPartialEmoji } from 'discord-api-types/v10';
import emojiJSON from '../../../static/misc/emoji.json';

export function getEmojiObject(emoji: string): Partial<APIPartialEmoji> {
  if (!emoji.match(CustomEmojiRegex)) {
    return {
      name: emojiJSON.find(({ char }) => char === emoji)?.name?.replaceAll(' ', '_'),
      id: emoji,
      animated: undefined,
    };
  }

  const [animated, name, id] = emoji.replaceAll(/[<|>]/g, '').split(':');

  return {
    id,
    name,
    animated: animated === 'a',
  };
}
