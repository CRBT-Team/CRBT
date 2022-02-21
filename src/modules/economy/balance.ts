import { db, emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'balance',
  description: "View a user's Purplet balance, or yours.",
  options: new OptionBuilder().user('user', 'The user whole balance you wish to view.'),
  async handle({ user }) {
    const u = user ?? this.user;

    try {
      const req = await db.profiles.findFirst({
        where: { id: u.id },
        select: { purplets: true },
      });
      const leaderboard = await db.profiles.findMany({
        where: { purplets: { gt: 0 } },
        orderBy: { purplets: 'desc' },
        select: { id: true, purplets: true },
      });

      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: `${u.tag} - Balance`, iconURL: avatar(u, 64) })
            .setDescription(
              `
            ${emojis.purplet} **${req ? req.purplets : 0} Purplets**`
            )
            .addField(
              'Leaderboard rank',
              !req
                ? 'Not on the global leaderboard (`/leaderboard`)'
                : `**${ordinal(leaderboard.findIndex((x) => x.id === u.id) + 1)}** out of ${
                    leaderboard.length
                  } people on the global leaderboard (\`/leaderboard\`)`
            )
            .setColor(await getColor(u)),
        ],
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});

function ordinal(x: number) {
  const j = x % 10,
    k = x % 100;
  if (j == 1 && k != 11) {
    return x + 'st';
  }
  if (j == 2 && k != 12) {
    return x + 'nd';
  }
  if (j == 3 && k != 13) {
    return x + 'rd';
  }
  return x + 'th';
}
