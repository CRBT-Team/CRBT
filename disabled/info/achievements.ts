import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { achievements, emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { progressBar } from '$lib/functions/progressBar';
import { getAllLanguages, t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { ButtonInteraction, CommandInteraction, Interaction, User } from 'discord.js';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'achievements',
  description: "View a list of a user's CRBT Achievements.",
  nameLocalizations: getAllLanguages('ACHIEVEMENTS', localeLower),
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to see yours.', {
    nameLocalizations: getAllLanguages('USER', localeLower),
  }),
  async handle({ user }) {
    user ??= this.user;

    await this.deferReply({
      ephemeral: true,
    });

    const res = await renderAchievementsPage.call(this, user);

    await this.editReply(res);
  },
});

async function renderAchievementsPage(this: Interaction, user: User | string, page: number = 0) {
  const u = typeof user === 'string' ? this.client.users.cache.get(user) : user;

  const data = await fetchWithCache(
    `achievements:${u.id}`,
    () =>
      prisma.user.findFirst({
        where: { id: u.id },
        select: { enableAchievements: true, globalAchievements: true },
      }),
    this instanceof CommandInteraction
  );

  const userAchievements = data.globalAchievements;

  const allAchievements = Object.entries(achievements)
    .map(([id, a]) => ({
      id,
      ...a,
    }))
    .sort((a, b) => {
      const ua = userAchievements.find((ua) => ua.achievement === a.id);
      const ub = userAchievements.find((ua) => ua.achievement === b.id);

      if (!ua?.progression && a.secret) return 1;

      const pa = (ua?.progression ?? 1) / a.steps;
      const pb = (ub?.progression ?? 1) / b.steps;

      return (pa > pb ? 1 : -1) ?? 1;
    });

  const pages = Math.ceil(allAchievements.length / 3);

  const fields = allAchievements
    .slice(page * 3, page * 3 + 3)
    .map(({ id, secret, steps, emoji, suggestedCommand }) => {
      const userData = userAchievements?.find((a) => a?.achievement === id);

      const title = t(this, `ACHIEVEMENT_${id}_TITLE` as any);
      const desc =
        u.id !== this.user.id && secret
          ? '?????'
          : t(this, `ACHIEVEMENT_${id}_DESC` as any, {
              command: suggestedCommand ? slashCmd(suggestedCommand) : null,
            });

      if (userAchievements && userData) {
        if (u.id !== this.user.id && !userData.achievedAt && secret) return;

        const { progression, achievedAt } = userData;
        const percentage = (progression / steps) * 100;

        if (userData.achievedAt) {
          return {
            name: `${emoji ?? '🔓'} ${title}`,
            value: `${desc} (Achieved ${timestampMention(achievedAt, 'R')})`,
          };
        } else {
          return {
            name: `${emojis.lock} ${title} (${percentage}% completed)`,
            value: desc,
          };
        }
      } else {
        return {
          name: `${emojis.lock} ${title}`,
          value: secret ? '?????' : desc,
        };
      }
    })
    .filter(Boolean);

  const overallProgress =
    allAchievements.reduce((acc, ach) => {
      const userData = userAchievements?.find((a) => a?.achievement === ach.id);

      if (userData?.progression) {
        return acc + (userData.progression / ach.steps) * 100;
      }

      return acc;
    }, 0) / allAchievements.length;

  return {
    embeds: [
      {
        author: {
          name: `${u.tag} - CRBT Achievements`,
          icon_url: avatar(u),
        },
        description:
          this.user.id === u.id && !data.enableAchievements
            ? `${emojis.error} **Achievements are currently disabled for you. Check ${slashCmd(
                'privacy'
              )} to enable the feature.**`
            : dedent`
        **${this.user.id === u.id ? "You've" : `${u.username} has`} achieved ${
                userAchievements.filter((a) => a.achievedAt).length
              }/${allAchievements.length}** (${overallProgress.toFixed(1)}%)
        ${progressBar(overallProgress)}
        `,
        fields,
        footer: {
          text: `Page ${page + 1}/${pages}`,
        },
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
  };
}

export interface PageBtnProps {
  page: number;
  userId?: string;
  s?: boolean;
}

export const GoToPage = ButtonComponent({
  async handle({ page, userId }: PageBtnProps) {
    this.update(await renderAchievementsPage.call(this, userId, page));
  },
});
