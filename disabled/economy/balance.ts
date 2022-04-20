import { db, emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { getStrings } from '$lib/language';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

const { meta } = getStrings('en-US').balance;

export default ChatCommand({
  ...meta,
  options: new OptionBuilder().user('user', meta.options[0].description),
  async handle({ user }) {
    const { strings } = getStrings(this.locale).balance;

    const m = (this.options.getMember('user') ?? this.member) as GuildMember;
    const u = user ?? this.user;

    try {
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
              iconURL: avatar(m, 64),
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
