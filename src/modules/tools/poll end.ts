import { colors, db, illustrations } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { GuildMember, MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'poll end',
  description: 'End a running poll.',
  options: new OptionBuilder().string(
    'poll_id',
    'The ID of the poll. Leave blank to end the latest poll.'
  ),
  async handle({ poll_id }) {
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }

    try {
      const pollData = poll_id
        ? await db.polls.findFirst({
            where: { id: `${this.channel.id}/${poll_id}` },
          })
        : (
            await db.polls.findMany({
              where: { id: { startsWith: this.channel.id } },
            })
          ).reverse()[0];

      if (!pollData && !poll_id) {
        return this.reply(
          CRBTError("Couldn't find a poll in this channel. To start one, use /poll start.")
        );
      } else if (!pollData) {
        return this.reply(
          CRBTError(
            'Couldn\'t find a poll in this channel with that ID. Look for the "Poll ID" in the footer of a poll to get its ID.'
          )
        );
      }
      if (
        this.user.id !== pollData.creator_id &&
        !(this.member as GuildMember).permissions.has('MANAGE_MESSAGES')
      ) {
        return this.reply(CRBTError('You can only end polls that you created!'));
      }

      const msg = await this.channel.messages.fetch(pollData.id.split('/')[1]);

      await db.polls.delete({
        where: {
          id: pollData.id,
        },
      });

      await msg.edit({
        embeds: [
          new MessageEmbed({
            ...msg.embeds[0],
            author: {
              name: 'Poll ended',
            },
            description: 'The poll has ended. You can no longer vote on it.',
          }),
        ],
        components: [],
      });

      const totalVotes = Number(msg.embeds[0].footer.text.split(' ')[2]);
      const ranking = msg.embeds[0].fields
        .map(({ name, value }) => {
          const votes = parseInt(value.split(' - ')[1].split(' ')[0]);
          return { name, votes };
        })
        .sort((a, b) => b.votes - a.votes);

      await msg.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('🎉 The results are in!')
            .setDescription(
              `"**${ranking[0].name}**" has won with ${ranking[0].votes} ${
                ranking[0].votes === 1 ? 'vote' : 'votes'
              } out of ${totalVotes}!\nClick the button below to view the full results.`
            )
            .setColor(`#${colors.success}`),
        ],
        components: components(
          row(new MessageButton().setLabel('Jump to poll').setStyle('LINK').setURL(msg.url))
        ),
      });

      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Successfully ended the poll.',
              iconURL: illustrations.success,
            })
            .setColor(`#${colors.success}`),
        ],
        ephemeral: true,
      });
    } catch (error) {
      return this.reply(UnknownError(this, String(error)));
    }
  },
});
