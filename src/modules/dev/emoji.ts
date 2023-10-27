import { emojis } from '$lib/env';
import { chunks } from '$lib/functions/chunks';
import { TextCommand } from 'purplet';

// export default
TextCommand({
  name: 'debug_emoji',
  async handle() {
    let emojiArray: string[] = [];

    function addEmojisFromObject(o) {
      Object.values(o).forEach((v) => {
        if (typeof v === 'string') {
          emojiArray.push(v);
        }
        if (typeof v === 'object') {
          addEmojisFromObject(v);
        }
      });
    }

    addEmojisFromObject(emojis);

    chunks(emojiArray, 50).forEach((c) => this.channel.send(c.join('')));

    this.reply('hi');
  },
});
