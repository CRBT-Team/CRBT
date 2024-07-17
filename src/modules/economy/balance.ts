import { prisma } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { currencyFormat, EconomyCommand } from './_helpers';
import { formatUsername } from '$lib/functions/formatUsername';
import { slashCmd } from '$lib/functions/commandMention';
import { fetchWithCache } from '$lib/cache';
import { assignLeaderboardRanks } from './leaderboard';

export const balance: EconomyCommand = {
  getMeta({ singular }) {
    return {
      name: 'balance',
      description: `Get a user's ${singular} balance.`,
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: 'user',
          description: 'The user whose balance to get. Leave blank to get yours.',
        },
      ],
    };
  },
  async handle() {
    const user = this.options.getUser('user') ?? this.user;

    try {
      const leaderboard = await fetchWithCache(
        `leaderboard:${this.guildId}`,
        () =>
          prisma.guildMember.findMany({
            where: { money: { gt: 0 }, guildId: this.guildId },
            orderBy: { money: 'desc' },
            select: { userId: true, money: true },
          }),
        true,
      );

      const rank = assignLeaderboardRanks(leaderboard).findIndex(
        ({ userId }) => userId === user.id,
      );

      const { economy } = await getGuildSettings(this.guildId);
      const { money } = leaderboard[rank] || { money: 0 };

      this.reply({
        embeds: [
          {
            author: {
              icon_url: avatar(user),
              name: `${formatUsername(user)} - Balance`,
            },
            description: currencyFormat({ money }, economy, this.locale, { zeroEqualsFree: false }),
            fields: [
              {
                name: 'Leaderboard Rank',
                value:
                  (money === 0
                    ? 'Not on the server leaderboard.'
                    : `**${ordinal(rank, this.locale)}** on the server leaderboard.`) +
                  ` (${slashCmd('leaderboard')})`,
              },
            ],
            color: await getColor(this.user),
          },
        ],
        ephemeral: true,
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
};

const suffixes = new Map([
  ['one', 'st'],
  ['two', 'nd'],
  ['few', 'rd'],
  ['other', 'th'],
]);

const ordinal = (n: number, lang: string) => {
  const intl = new Intl.PluralRules(lang, { type: 'ordinal' });
  const rule = intl.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
};
