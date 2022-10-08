import { db, emojis } from '$lib/env';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { getStrings } from '$lib/language';
import { Interaction, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';

const { DEPRECATION_DESCRIPTION } = getStrings('en-US').globalErrors;

export default ChatCommand({
  name: 'leaderboard',
  description: `${DEPRECATION_DESCRIPTION} View the CRBT global Purplet leaderboard.`,
  async handle() {
    try {
      const lb = await renderLeaderboard(this, 1);
      return this.reply(lb);
    } catch (error) {
      this.reply(UnknownError(this, error));
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
  const { DEPRECATION_TITLE, DEPRECATION_NOTICE } = getStrings(ctx.locale).globalErrors;
  const { PREVIOUS, NEXT } = getStrings(ctx.locale).genericButtons;

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
              return `**${u.rank}.** ${u.name
                  ? `@${u.name}`
                  : ctx.client.users.cache.get(u.id)?.username ??
                  ctx.client.users.fetch(u.id).then((u) => u.username)
                } - **${emojis.purplet} ${u.purplets.toLocaleString()} Purplets**`;
            })
            .slice((page - 1) * 10, page * 10)
            .join('\n')
        )
        .addField(
          'Your position',
          !userProfile
            ? 'Not on the leaderboard'
            : `**${leaderboard.findIndex((x) => x.id === ctx.user.id) + 1}.** ${userProfile.name ? `@${userProfile.name}` : ctx.user.username
            } - ${emojis.purplet} **${userProfile.purplets.toLocaleString()} Purplets**`
        )
        .addField(DEPRECATION_TITLE, DEPRECATION_NOTICE)
        .setColor(await getColor(ctx.user)),
    ],
    components: components(
      row(
        new PreviousBtn(page)
          .setLabel(PREVIOUS)
          .setStyle('SECONDARY')
          .setDisabled(page === 1),
        new NextBtn(page)
          .setLabel(NEXT)
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
