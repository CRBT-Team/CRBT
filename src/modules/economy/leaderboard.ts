import { db, emojis } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'leaderboard',
  description: 'View the CRBT global Purplet leaderboard.',
  async handle() {
    try {
      const leaderboard = await db.profiles.findMany({
        where: { purplets: { gt: 0 } },
        orderBy: { purplets: 'desc' },
        select: { id: true, purplets: true },
      });

      this.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              'Global Purplets leaderboard ' +
                (leaderboard.length > 10
                  ? `(Top 10/${leaderboard.length})`
                  : `(${leaderboard.length})`)
            )
            .setDescription(
              assignLeaderboardRanks(leaderboard)
                .map((u) => {
                  return `**${u.rank}.** ${this.client.users.cache.get(u.id).username} - **${
                    emojis.purplet
                  } ${u.purplets} Purplets**`;
                })
                .slice(0, 10)
                .join('\n')
            )
            .addField(
              'Your position',
              !leaderboard.find((x) => x.id === this.user.id)
                ? 'Not on the leaderboard'
                : `**${leaderboard.findIndex((x) => x.id === this.user.id) + 1}.** ${
                    this.user.username
                  } - ${emojis.purplet} **${
                    leaderboard.find((x) => x.id === this.user.id).purplets
                  } Purplets**`
            )
            .setColor(await getColor(this.user)),
        ],
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});

const assignLeaderboardRanks = (leaderboard: any[]) => {
  let rank = 1;
  return leaderboard.map((u, i) => {
    const { purplets } = u;

    if (i > 0 && purplets < leaderboard[i - 1].purplets) {
      rank = i + 1;
    }

    return { ...u, rank };
  });
};
