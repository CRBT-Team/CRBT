import { colors, db, emojis, illustrations } from '$lib/db';
import { CooldownError } from '$lib/functions/CRBTError';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, components, row } from 'purplet';
import { RemindButton } from '../components/RemindButton';

const usersOnCooldown = new Map();

export default ChatCommand({
  name: 'hourly',
  description: 'Get a few Purplets',
  async handle() {
    if (usersOnCooldown.has(this.user.id)) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id)));
    }

    const currentStreak =
      ((
        await db.users.findFirst({
          where: { id: this.user.id },
          select: { hstreak: true },
        })
      )?.hstreak ?? 0) + 1;

    if (currentStreak < 5) {
      await db.users.upsert({
        create: { hstreak: currentStreak, id: this.user.id },
        update: { hstreak: currentStreak },
        where: { id: this.user.id },
      });
    } else {
      await db.users.upsert({
        create: { hstreak: 0, id: this.user.id },
        update: { hstreak: 0 },
        where: { id: this.user.id },
      });
    }

    usersOnCooldown.set(this.user.id, Date.now() + 3.6e6);
    setTimeout(() => usersOnCooldown.delete(this.user.id), 3.6e6);

    const user = await db.profiles.findFirst({
      where: { id: this.user.id },
      select: { purplets: true },
    });

    const income = currentStreak < 5 ? Math.floor(Math.random() * (50 - 20 + 1)) + 20 : 100;

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
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Hourly Purplets claimed!',
            iconURL: illustrations.success,
          })
          .setDescription(
            (currentStreak < 5
              ? `You claimed your hourly **${
                  emojis.purplet
                } ${income} Purplets**.\nCurrent streak: **${currentStreak}/5** (${
                  5 - currentStreak
                } more to go for a bonus!)`
              : `You claimed your hourly **${emojis.purplet} ${income} Purplets**. (5 streak bonus!)`) +
              '\nClick the button below to set yourself a reminder to claim your hourly Purplets again.'
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(
          new RemindButton({ relativetime: Date.now() + 3.6e6, userId: this.user.id })
            // new RemindButton(3.6e6)
            .setStyle('SECONDARY')
            .setLabel('Add Reminder')
            .setEmoji(emojis.misc.reminder)
        )
      ),
    });
  },
});
