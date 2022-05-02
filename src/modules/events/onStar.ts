import { colors } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { row } from '$lib/functions/row';
import {
  MessageButton,
  MessageEmbed,
  MessageReaction,
  PartialMessageReaction,
  TextBasedChannel,
} from 'discord.js';
import { components, OnEvent } from 'purplet';

console.log('ok');

export const add = OnEvent('messageReactionAdd', async (reaction, user) => {
  console.log('ok');
  const { message, emoji } = reaction;

  if (emoji.name !== '⭐') return;
  if (message.author.id === user.id) return;
  if (message.author.bot) return;

  const starChannel = message.guild.channels.cache.find(
    (c) => c.name === 'starboard' && c.isText()
  ) as TextBasedChannel;

  if (!starChannel) return;

  const content = renderStarboardMsg(reaction);

  if (reaction.count === 1) {
    await starChannel.send(content);
  } else {
    const starMessages = await starChannel.messages.fetch({
      after: reaction.message.id,
      limit: 100,
    });
    const starMsg = starMessages.find((m) => m.embeds[0].footer.text.endsWith(message.id));

    await starMsg.edit(content);
  }
});

export const remove = OnEvent('messageReactionRemove', async (reaction, user) => {
  console.log('ok');
  const { message, emoji } = reaction;

  if (emoji.name !== '⭐') return;
  if (message.author.id === user.id) return;
  if (message.author.bot) return;

  const starChannel = message.guild.channels.cache.find(
    (c) => c.name === 'starboard' && c.isText()
  ) as TextBasedChannel;

  if (!starChannel) return;

  const content = renderStarboardMsg(reaction);

  if (reaction.count !== 0) {
    await starChannel.send(content);
  } else {
    const starMessages = await starChannel.messages.fetch({
      after: reaction.message.id,
      limit: 100,
    });
    const starMsg = starMessages.find((m) => m.embeds[0].footer.text.endsWith(message.id));

    await starMsg.delete();
  }
  reaction.message.channel.send(`${user.username} removed a star!`);
});

function renderStarboardMsg(reaction: MessageReaction | PartialMessageReaction) {
  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: reaction.message.author.tag,
          iconURL: avatar(reaction.message.author, 64),
        })
        .setDescription(reaction.message.content)
        .setFooter({
          text: `⭐ ${reaction.count} • ${reaction.message.id}`,
        })
        .setTimestamp(reaction.message.createdAt)
        .setColor(`#${colors.yellow}`),
    ],
    components: components(
      row(
        new MessageButton()
          .setURL(reaction.message.url)
          .setLabel('Jump to message')
          .setStyle('LINK')
      )
    ),
  };
}
