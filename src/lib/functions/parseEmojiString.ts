import { CustomEmojiRegex, emojiMention } from '@purplet/utils';
import { Collection, GuildEmoji } from 'discord.js';
import emojiJSON from '../../../static/misc/emoji.json';
import { getEmojiObject } from './getEmojiObject';

export async function parseEmojiString(
  emoji: string | undefined,
  guildEmojis: Collection<string, GuildEmoji>
) {
  const emojiObj = getEmojiObject(emoji);
  const fromJSON = emojiJSON.find(
    ({ name }) =>
      name.toLowerCase().replaceAll(' ', '_') ===
      emoji.toLowerCase().replaceAll(' ', '_').replaceAll(':', '')
  );
  const fromEmojis = guildEmojis.find(({ name }) => name === emoji.replaceAll(':', ''));
  if (emojiObj && emojiObj.name && emojiObj.animated === undefined) {
    return emoji;
  } else if (fromJSON) {
    return fromJSON.char;
  } else if (emoji.match(CustomEmojiRegex)) {
    return emoji;
  } else if (fromEmojis) {
    return emojiMention(fromEmojis);
  } else {
    return null;
  }
}
