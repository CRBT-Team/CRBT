import { prisma } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { EconomyCommand } from './_helpers';

export const balance: EconomyCommand = {
  getMeta() {
    return {
      name: 'balance',
      description: "Get a user's balance for this server.",
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
      const leaderboard = await prisma.guildMember.findMany({
        where: { id: `${user.id}_${this.guildId}` },
        orderBy: { money: 'desc' },
        select: { userId: true, money: true },
      });

      const rank = leaderboard.findIndex(({ userId }) => userId === user.id);
      console.log(rank);

      const { economy } = await getGuildSettings(this.guildId);
      const { money } = leaderboard[rank] || { money: 0 };

      this.reply({
        embeds: [
          {
            author: {
              icon_url: avatar(user),
              name: `${user.tag} - Balance`,
            },
            description: `${economy.currencySymbol} ${money} ${
              money === 1 ? economy.currencyNamePlural : economy.currencyNamePlural
            }`,
            fields: [
              {
                name: 'Leaderboard Rank',
                value:
                  money === 0
                    ? 'Not on the server leaderboard.'
                    : `**${ordinal(rank + 1, this.locale)}** on the server leaderboard.`,
              },
            ],
            color: await getColor(this.user),
          },
        ],
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
