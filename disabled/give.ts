import { colors, db, emojis, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'give',
  description: 'Give a given amount of your Purplets to a user.',
  options: new OptionBuilder()
    .user('user', 'The user to give your Purplets to.', true)
    .integer('amount', 'The amount of Purplets you want to give.', true),
  async handle({ user, amount }) {
    if (user.bot) {
      return this.reply(CRBTError('You cannot give Purplets to a bot.'));
    }
    if (user.equals(this.user)) {
      return this.reply(CRBTError('You cannot give Purplets to yourself.'));
    }

    if (amount < 1) {
      return this.reply(CRBTError("You can't give a negative value of Purplets or... nothing."));
    }

    try {
      const userPurplets = await db.profiles.findFirst({
        where: { id: this.user.id },
        select: { purplets: true },
      });

      if (!userPurplets || !userPurplets.purplets || userPurplets.purplets < amount) {
        return this.reply(
          CRBTError("You don't have enough Purplets!", true, [
            {
              name: 'Your current balance',
              value: `**${emojis.purplet} ${userPurplets.purplets} Purplets**`,
              inline: true,
            },
            {
              name: 'Purplets missing',
              value: `**${emojis.purplet} ${amount - userPurplets.purplets} Purplets**`,
              inline: true,
            },
          ])
        );
      }

      const targetUser = await db.profiles.upsert({
        where: { id: user.id },
        update: { purplets: { increment: amount } },
        create: { id: user.id, purplets: amount },
      });

      await db.profiles.update({
        data: { purplets: { decrement: amount } },
        where: { id: this.user.id },
      });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Purplets transfer',
              iconURL: icons.success,
            })
            .setDescription(
              `You successfully gave ${emojis.purplet} **${amount} Purplets** to ${user}.`
            )
            .addField(
              'Your balance',
              `Previous: **${emojis.purplet} ${userPurplets.purplets}**\nNew: **${emojis.purplet} ${
                userPurplets.purplets - amount
              }**`,
              true
            )
            .addField(
              `Their balance`,
              `Previous: **${emojis.purplet} ${targetUser.purplets - amount}**\nNew: **${
                emojis.purplet
              } ${targetUser.purplets}**`,
              true
            )
            .setColor(`#${colors.success}`),
        ],
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});
