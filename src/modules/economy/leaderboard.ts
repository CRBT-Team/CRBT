import { db, emojis } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { Interaction, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'leaderboard',
  description: 'View the CRBT global Purplet leaderboard.',
  async handle() {
    try {
      const lb = await renderLeaderboard(this, 1);
      return this.reply(lb);
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

const renderLeaderboard = async (ctx: Interaction, page: number) => {
  const leaderboard = await db.profiles.findMany({
    where: { purplets: { gt: 0 } },
    orderBy: { purplets: 'desc' },
    select: { id: true, purplets: true, name: true },
  });

  const userProfile = leaderboard.find((u) => u.id === ctx.user.id);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `Global Purplets leaderboard (Page ${page}/${Math.ceil(leaderboard.length / 10)})`,
          iconURL: 'https://cdn.discordapp.com/emojis/866116902215745576.png',
        })
        .setDescription(
          assignLeaderboardRanks(leaderboard)
            .map((u) => {
              return `**${u.rank}.** ${
                u.name
                  ? `@${u.name}`
                  : ctx.client.users.cache.get(u.id)?.username ??
                    ctx.client.users.fetch(u.id).then((u) => u.username)
              } - **${emojis.purplet} ${u.purplets} Purplets**`;
            })
            .slice((page - 1) * 10, page * 10)
            .join('\n')
        )
        .addField(
          'Your position',
          !userProfile
            ? 'Not on the leaderboard'
            : `**${leaderboard.findIndex((x) => x.id === ctx.user.id) + 1}.** ${
                userProfile.name ? `@${userProfile.name}` : ctx.user.username
              } - ${emojis.purplet} **${userProfile.purplets} Purplets**`
        )
        .setColor(await getColor(ctx.user)),
    ],
    components: components(
      row(
        new PreviousBtn(page)
          .setLabel('Previous page')
          .setStyle('SECONDARY')
          .setDisabled(page === 1),
        new NextBtn(page)
          .setLabel('Next page')
          .setStyle('SECONDARY')
          .setDisabled(page === Math.ceil(leaderboard.length / 10))
      )
    ),
  };
};

export const NextBtn = ButtonComponent({
  async handle(page: number) {
    this.update(await renderLeaderboard(this, page + 1));
  },
});

export const PreviousBtn = ButtonComponent({
  async handle(page: number) {
    this.update(await renderLeaderboard(this, page - 1));
  },
});
