import { db, emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { getStrings } from '$lib/language';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'balance',
  description: "View a user's Purplet balance, or yours.",
  options: new OptionBuilder().user('user', 'The user to view the balance of.'),
  async handle({ user }) {
    const { strings, errors } = getStrings(this.locale, 'balance');

    const u = user ?? this.user;

    try {
      // const req = await db.profiles.findFirst({
      //   where: { id: u.id },
      //   select: { purplets: true },
      // });
      const leaderboard = await db.profiles.findMany({
        where: { purplets: { gt: 0 } },
        orderBy: { purplets: 'desc' },
        select: { id: true, purplets: true },
      });

      const req = leaderboard.find((x) => x.id === u.id);

      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.EMBED_TITLE.replace('<user>', u.tag),
              iconURL: avatar(u, 64),
            })
            .setDescription(
              `${emojis.purplet} **${strings.EMBED_DESCRIPTION.replace(
                '<PURPLETS>',
                `${req ? req.purplets : 0}`
              )}**`
            )
            .addField(
              strings.LEADERBOARD_TITLE,
              !req
                ? strings.LEADERBOARD_NOTPRESENT
                : `${strings.LEADERBOARD_NOTPRESENT.replace(
                    '<PLACE>',
                    `**${ordinal(leaderboard.findIndex((x) => x.id === u.id) + 1)}**`
                  ).replace('<TOTAL>', leaderboard.length.toString())} (\`/leaderboard\`)`
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
