import { colors } from '$lib/db';
import { getStrings } from '$lib/language';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

// const usersOnCooldown = new Map();
const { meta } = getStrings('en-US').hourly;
const { DEPRECATION_DESCRIPTION } = getStrings('en-US').globalErrors;

export default ChatCommand({
  name: 'hourly',
  description: `${DEPRECATION_DESCRIPTION} ${meta.description}`,
  async handle() {
    const { DEPRECATION_TITLE, DEPRECATION_NOTICE } = getStrings(this.locale).globalErrors;

    this.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(DEPRECATION_TITLE)
          .setDescription(DEPRECATION_NOTICE)
          .setColor(`#${colors.yellow}`),
      ],
    });

    // if (usersOnCooldown.has(this.user.id)) {
    //   return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id)));
    // }

    // const { strings } = getStrings(this.locale).hourly;
    // const { ADD_REMINDER } = getStrings(this.locale).genericButtons;

    // await this.deferReply();

    // const user = await db.profiles.findFirst({
    //   where: { id: this.user.id },
    //   select: { purplets: true },
    // });

    // const currentStreak =
    //   ((
    //     await db.users.findFirst({
    //       where: { id: this.user.id },
    //       select: { hstreak: true },
    //     })
    //   )?.hstreak ?? 0) + 1;

    // const rawIncome = getPurplets(user.purplets);
    // const income = currentStreak > 5 ? rawIncome * 1.3 : rawIncome;

    // await db.users.upsert({
    //   create: { hstreak: currentStreak < 5 ? currentStreak : 0, id: this.user.id },
    //   update: { hstreak: currentStreak < 5 ? currentStreak : 0 },
    //   where: { id: this.user.id },
    // });

    // await db.profiles.upsert({
    //   create: { purplets: income, id: this.user.id },
    //   update: { purplets: { increment: income } },
    //   where: { id: this.user.id },
    // });

    // await this.editReply({
    //   embeds: [
    //     new MessageEmbed()
    //       .setAuthor({
    //         name: strings.EMBED_TITLE,
    //         iconURL: icons.success,
    //       })
    //       .setDescription(
    //         `${strings.EMBED_DESCRIPTION.replace(
    //           '<PURPLETS>',
    //           `${emojis.purplet} **${income} Purplets**`
    //         )} ${
    //           currentStreak < 5
    //             ? strings.STREAK.replace('<STREAK_LEFT>', `${5 - currentStreak}`)
    //             : strings.STREAK_BONUS
    //         } ${strings.EMBED_REMINDER}`
    //       )
    //       .setColor(`#${colors.success}`),
    //   ],
    //   components: components(
    //     row(
    //       new RemindButton({
    //         relativetime: Date.now() + 3.6e6,
    //         userId: this.user.id,
    //         locale: this.locale,
    //       })
    //         .setStyle('SECONDARY')
    //         .setLabel(ADD_REMINDER)
    //         .setEmoji(emojis.reminder)
    //     )
    //   ),
    // });

    // usersOnCooldown.set(this.user.id, Date.now() + 3.6e6);
    // setTimeout(() => usersOnCooldown.delete(this.user.id), 3.6e6);
  },
});

// function getPurplets(n: number) {
//   if (n > 20000) {
//     return Math.floor(Math.random() * (0 - 20 + 1) + 0);
//     // return { range: [0, 20], out: Math.floor(Math.random() * (0 - 20 + 1) + 0) };
//   }
//   const max = Math.floor(-0.004 * n + 100);
//   const min = max - 20;
//   const rand = Math.floor(Math.random() * (max - min + 1)) + min;
//   return rand;
//   // return { range: [min, max], out: rand };
// }
