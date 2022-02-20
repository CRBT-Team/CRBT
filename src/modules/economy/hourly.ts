import { db } from '$lib/db';
import { CooldownError } from '$lib/functions/CRBTError';
import { ChatCommand } from 'purplet';

const usersOnCooldown = new Map();

export default ChatCommand({
  name: 'hourly',
  description: 'Get a few Purplets',
  async handle() {
    if (usersOnCooldown.has(this.user.id)) {
      return this.reply(CooldownError(await usersOnCooldown.get(this.user.id)));
    }
    usersOnCooldown.set(this.user.id, Date.now() + 30000);
    setTimeout(() => usersOnCooldown.delete(this.user.id), 30000);

    const user = await db.profiles.findFirst({ where: { id: this.user.id } });
    const income = Math.floor(Math.random() * (50 - 20 + 1)) + 20;

    if (user) {
      await db.profiles.update({
        where: {
          id: this.user.id,
        },
        data: {
          purplets: user.purplets + income,
        },
      });
    } else {
      await db.profiles.create({
        data: {
          id: this.user.id,
          purplets: income,
        },
      });
    }
    await this.reply(`You earned ${income} Purplets!`);
  },
});
