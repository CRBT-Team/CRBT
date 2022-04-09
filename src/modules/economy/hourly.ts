import { colors, db, emojis, illustrations } from '$lib/db';
import { CooldownError } from '$lib/functions/CRBTError';
import { row } from '$lib/functions/row';
import { languages } from '$lib/language';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, components } from 'purplet';
import { RemindButton } from '../components/RemindButton';

const usersOnCooldown = new Map();
const { meta } = languages['en-US'].hourly;

export default ChatCommand({
  ...meta,
  async handle() {
    if (usersOnCooldown.has(this.user.id)) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id)));
    }

    const { strings } = languages[this.locale].hourly;
    const { ADD_REMINDER } = languages[this.locale].genericButtons;

    await this.deferReply();

    const user = await db.profiles.findFirst({
      where: { id: this.user.id },
      select: { purplets: true },
    });

    const currentStreak =
      ((
        await db.users.findFirst({
          where: { id: this.user.id },
          select: { hstreak: true },
        })
      )?.hstreak ?? 0) + 1;

    const rawIncome = getPurplets(user.purplets);
    const income = currentStreak > 5 ? rawIncome * 1.3 : rawIncome;

    await db.users.upsert({
      create: { hstreak: currentStreak < 5 ? currentStreak : 0, id: this.user.id },
      update: { hstreak: currentStreak < 5 ? currentStreak : 0 },
      where: { id: this.user.id },
    });

    await db.profiles.upsert({
      create: { purplets: income, id: this.user.id },
      update: { purplets: { increment: income } },
      where: { id: this.user.id },
    });

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: strings.EMBED_TITLE,
            iconURL: illustrations.success,
          })
          .setDescription(
            `${strings.EMBED_DESCRIPTION.replace('<EMOJI>', emojis.purplet)
              .replace(`<PURPLETS>`, `${income}`)
              .replace('<STREAK>', `${currentStreak}`)} ${
              currentStreak < 5
                ? strings.STREAK.replace('<STREAK_LEFT>', `${5 - currentStreak}`)
                : strings.STREAK_BONUS
            } ${strings.EMBED_REMINDER}`
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(
          new RemindButton({ relativetime: Date.now() + 3.6e6, userId: this.user.id })
            .setStyle('SECONDARY')
            .setLabel(ADD_REMINDER)
            .setEmoji(emojis.misc.reminder)
        )
      ),
    });

    usersOnCooldown.set(this.user.id, Date.now() + 3.6e6);
    setTimeout(() => usersOnCooldown.delete(this.user.id), 3.6e6);
  },
});

function getPurplets(n: number) {
  if (n > 20000) {
    return Math.floor(Math.random() * (0 - 20 + 1) + 0);
    // return { range: [0, 20], out: Math.floor(Math.random() * (0 - 20 + 1) + 0) };
  }
  const max = Math.floor(-0.004 * n + 100);
  const min = max - 20;
  const rand = Math.floor(Math.random() * (max - min + 1)) + min;
  return rand;
  // return { range: [min, max], out: rand };
}
