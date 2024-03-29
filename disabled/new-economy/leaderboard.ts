import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { CommandInteraction, Interaction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../settings/serverSettings/_helpers';
import { currencyFormat, EconomyCommand } from './_helpers';

export const leaderboard: EconomyCommand = {
  getMeta() {
    return {
      name: 'leaderboard',
      description: `View the server leaderboard.`,
    };
  },
  async handle() {
    try {
      const lb = await renderLeaderboard.call(this, 1);
      return this.reply(lb);
    } catch (e) {
      this.reply(UnknownError(this, e));
    }
  },
};

const assignLeaderboardRanks = (leaderboard: { money: number; userId: string }[]) => {
  let rank = 1;
  return leaderboard.map((u, i) => {
    if (i > 0 && u.money < leaderboard[i - 1].money) {
      rank = i + 1;
    }
    return { ...u, rank };
  });
};

async function renderLeaderboard(this: Interaction, page: number) {
  const leaderboard = await fetchWithCache(
    `leaderboard:${this.guildId}`,
    () =>
      prisma.serverMember.findMany({
        where: { money: { gt: 0 }, serverId: this.guildId },
        orderBy: { money: 'desc' },
        select: { userId: true, money: true },
      }),
    this instanceof CommandInteraction
  );

  const { economy } = await getGuildSettings(this.guildId);
  const userData = leaderboard.find(({ userId }) => userId === this.user.id);
  const self = this;

  function renderUser(user: { money: number; userId: string }, rank: number) {
    return `**${rank}.** <@${user.userId}> - **${currencyFormat(user, economy, self.locale)}**`;
  }

  return {
    embeds: [
      {
        author: {
          name: `${this.guild.name} - Leaderboard`,
          icon_url: this.guild.iconURL(),
        },
        description: assignLeaderboardRanks(leaderboard)
          .map((u) => renderUser(u, u.rank))
          .slice((page - 1) * 10, page * 10)
          .join('\n'),
        fields: [
          {
            name: 'Your position',
            value: !userData
              ? 'Not on the leaderboard'
              : renderUser(userData, leaderboard.indexOf(userData) + 1),
          },
        ],
        footer: {
          text: t(this, 'PAGINATION_PAGE_OUT_OF', {
            page: page.toLocaleString(this.locale),
            pages: Math.ceil(leaderboard.length > 10 ? leaderboard.length / 10 : 1).toLocaleString(
              this.locale
            ),
          }),
        },
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(
        new GotoPageBtn(page - 1)
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('PRIMARY')
          .setDisabled(page === 1),
        new GotoPageBtn(page + 1)
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle('PRIMARY')
          .setDisabled(page === Math.ceil(leaderboard.length / 10))
      )
    ),
  };
}

export const GotoPageBtn = ButtonComponent({
  async handle(page: number) {
    this.update(await renderLeaderboard.call(this, page));
  },
});
