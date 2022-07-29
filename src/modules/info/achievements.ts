import { achievements, db } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'achievements',
  description: "View a list of a user's CRBT achievements.",
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to see yours.'),
  async handle({ user }) {
    const u = user ?? this.user;

    const userAchievements = await db.users.findFirst({
      where: { id: u.id },
      select: { achievements: true },
    });

    const fields = Object.entries(achievements)
      .map(([id, { howToGet, name, secret, steps }]) => {
        const userData = userAchievements?.achievements?.find((a) => a?.achievement === id);

        console.log(id);
        if (userAchievements?.achievements && userData) {
          if (u.id !== this.user.id && !userData.achievedAt && secret) return;

          const { progression, achievedAt } = userData;
          const percentage = (progression / steps) * 100;

          if (userData.achievedAt) {
            return {
              name: `🔓 ${name}`,
              value:
                `${percentage}% completed • Achieved <t:${Math.round(
                  achievedAt.getTime() / 1000
                )}:R>` + (u.id !== this.user.id && secret ? '' : `\n${howToGet}`),
            };
          } else {
            return {
              name: `🔒 ${name}`,
              value:
                `${percentage}% completed` +
                (u.id !== this.user.id && secret ? '' : `\n${howToGet}`),
            };
          }
        } else {
          if (secret) return;
          return {
            name: `🔒 ${name}`,
            value: howToGet,
          };
        }
      })
      .filter(Boolean);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${u.tag} - Achievements`,
            iconURL: avatar(u),
          })
          .setFields(fields)
          .setColor(await getColor(u)),
      ],
      ephemeral: true,
    });

    console.log(fields);
  },
});
