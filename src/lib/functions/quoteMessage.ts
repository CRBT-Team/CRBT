import { Message, MessageEmbed } from 'discord.js';
import { avatar } from './avatar';
import { getColor } from './getColor';

export async function quoteMessage(message: Message) {
  return new MessageEmbed()
    .setAuthor(message.author.tag, avatar(message.author, 64))
    .setDescription(message.content)
    .setTimestamp(message.createdAt)
    .setColor(await getColor(message.author));
}
