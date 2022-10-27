import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { achievements, emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { progressBar } from '$lib/functions/progressBar';
import type { Achievement } from '$lib/responses/Achievements';
import { timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { MessageFlags } from 'discord-api-types/v10';
import { ButtonInteraction, CommandInteraction, Interaction, User } from 'discord.js';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'achievements',
  description: "View a list of a user's CRBT achievements.",
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to see yours.'),
  async handle({ user }) {
    const u = user ?? this.user;

    await this.reply(await renderAchievementsPage.call(this, u, 0));
  },
});

async function renderAchievementsPage(this: Interaction, user: User | string, page: number) {
  const u = typeof user === 'string' ? this.client.users.cache.get(user) : user;

  const userAchievements = await fetchWithCache(
    `achievements:${u.id}`,
    () =>
      prisma.achievements.findMany({
        where: { userId: u.id },
      }),
    this instanceof CommandInteraction
  );

  const allAchievements = Object.entries(achievements as { [k: string]: Achievement }).sort(
    ([a, aa], [b, ab]) => {
      const ua = userAchievements.find((ua) => ua.achievement === a);
      const ub = userAchievements.find((ua) => ua.achievement === b);

      if (ua?.achievedAt) return 1;
      if (!ua?.progression && aa.secret) return 1;

      const pa = (ua?.progression ?? 1) / aa.steps;
      const pb = (ub?.progression ?? 1) / ab.steps;
      console.log(`${a}=${pa}    ${b}=${pb}     ${pa > pb}`);

      return (pa > pb ? 1 : -1) ?? 1;
    }
  );

  const pages = Math.round(allAchievements.length / 3);

  console.log(page, pages);

  const fields = allAchievements
    .slice(page * 3, page * 3 + 3)
    .map(([id, { howToGet, name, secret, steps, emoji }]) => {
      const userData = userAchievements?.find((a) => a?.achievement === id);

      if (userAchievements && userData) {
        if (u.id !== this.user.id && !userData.achievedAt && secret) return;

        const { progression, achievedAt } = userData;
        const percentage = (progression / steps) * 100;

        howToGet = u.id !== this.user.id && secret ? '?????' : howToGet;

        if (userData.achievedAt) {
          return {
            name: `${emoji ? `<:a:${emoji}>` : '🔓'} ${name}`,
            value: `${howToGet} (Achieved ${timestampMention(achievedAt, 'R')})`,
          };
        } else {
          return {
            name: `${emojis.lock} ${name} (${percentage}% completed)`,
            value: howToGet,
          };
        }
      } else {
        return {
          name: `${emojis.lock} ${name}`,
          value: secret ? '?????' : howToGet,
        };
      }
    })
    .filter(Boolean);

  const overallProgress =
    allAchievements.reduce((acc, [id, ach]) => {
      const userData = userAchievements?.find((a) => a?.achievement === id);

      if (userData?.progression) {
        return acc + (userData.progression / ach.steps) * 100;
      }

      return acc;
    }, 0) / allAchievements.length;

  return {
    embeds: [
      {
        author: {
          name: `${u.tag} - Achievements`,
          icon_url: avatar(u),
        },
        description: dedent`
        **${this.user.id === u.id ? "You've" : `${u.username} has`} unlocked ${
          userAchievements.filter((a) => a.achievedAt).length
        }/${allAchievements.length}** (${overallProgress.toPrecision(2)}%)
        ${progressBar(overallProgress)}
        `,
        fields,
        color: this instanceof ButtonInteraction ? this.message.embeds[0].color : await getColor(u),
      },
    ],
    components: components(
      row(
        new GoToPage({ userId: u.id, page: page - 1 })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.left_arrow)
          .setDisabled(page - 1 < 0),
        new GoToPage({ userId: u.id, page: page + 1 })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.right_arrow)
          .setDisabled(page + 1 >= pages)
      )
    ),
    flags: MessageFlags.Ephemeral,
  };
}

interface PageBtnProps {
  page: number;
  userId: string;
}

export const GoToPage = ButtonComponent({
  async handle({ page, userId }: PageBtnProps) {
    this.update(await renderAchievementsPage.call(this, userId, page));
  },
});
