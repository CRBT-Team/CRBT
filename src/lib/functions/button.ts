import { EmojiRegex } from '$lib/util/regex';
import { MessageButtonStyle } from 'discord.js';

export function button(
  style: MessageButtonStyle,
  label: string,
  id: string,
  active: boolean = true,
  emoji?: string
) {
  enum ButtonStyle {
    PRIMARY = 1,
    SECONDARY = 2,
    SUCCESS = 3,
    DANGER = 4,
    LINK = 5,
  }
  let btnEmoji: {
    id: string | null;
    name: string;
    animated?: boolean;
  };
  if (emoji && emoji.match(EmojiRegex)) {
    const emote = emoji.split(':');
    btnEmoji = {
      name: emote[1],
      id: emote[2].replaceAll('>', ''),
      animated: emote[0].includes('<a'),
    };
  } else if (emoji) {
    btnEmoji = {
      id: null,
      name: emoji,
    };
  }
  return {
    type: 2,
    style: ButtonStyle[style],
    label: label,
    emoji: btnEmoji,
    custom_id: style === 'LINK' ? null : id,
    url: style === 'LINK' ? id : null,
    disabled: !active,
  };
}
