import { colors, db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
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

    const pollData = poll_id
      ? await db.polls.findFirst({
          where: { id: `${this.channel.id}/${poll_id}` },
        })
      : await db.polls.findFirst({
          where: { id: { startsWith: this.channel.id } },
        });

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
      this.user.id !== pollData.creator_id ||
      !(this.member as GuildMember).permissions.has('MANAGE_MESSAGES')
    ) {
      return this.reply(CRBTError('You can only end polls that you created!'));
    }

    const msg = await this.channel.messages.fetch(pollData.id);

    await db.polls.delete({
      where: { id: poll_id },
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
            } out of ${totalVotes}!`
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(new MessageButton().setLabel('Jump to poll').setStyle('LINK').setURL(msg.url))
      ),
    });
  },
});
