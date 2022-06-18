import { db } from '$lib/db';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'modlogs user',
  description: 'View the moderation history for a chosen user, or yours.',
  options: new OptionBuilder().user('user', 'The user to view the history of.'),
  async handle({ user }) {
    user = user || this.user;

    const data = await db.moderationStrikes.findMany({
      where: { targetId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const embed = new MessageEmbed()
      .setAuthor({
        name: `${user.username}#${user.discriminator} - Moderation history in ${this.guild.name}`,
        iconURL: user.avatarURL(),
      })
      .setFields(
        data.map((strike) => {
          return {
            name: `${strike.type} - <t:${Math.floor(strike.createdAt.getTime() / 1000)}:R>`,
            value: `${strike.reason}\nBy <@${strike.moderatorId}>`,
          };
        })
      )
      .setColor(await getColor(this.user));

    await this.reply({ embeds: [embed] });
  },
});
