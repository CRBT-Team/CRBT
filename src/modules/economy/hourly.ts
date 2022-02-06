import { db } from '$lib/db';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'hourly',
  description: 'Get a few Purplets',
  async handle() {
    const user = (await db.from<APIProfile>('profiles').select('*').eq('id', this.user.id)).body[0];
    const income = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
    if (user) {
      await db.rpc('increment', { x: income, row_id: this.user.id });
    } else {
      await db.from<APIProfile>('profiles').insert({
        id: this.user.id,
        purplets: income,
      });
    }
    // add income to user's purplets

    await this.reply(`You earned ${income} Purplets!`);
  },
});
