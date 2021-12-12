import { colors, illustrations } from '$lib/db';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';

export function CRBTError(
  desc: string = '',
  title: string = 'An error occured!',
  footer: string = ''
): InteractionReplyOptions {
  return {
    embeds: [
      new MessageEmbed()
        .setAuthor(title, illustrations.error)
        .setDescription(desc)
        .setColor(`#${colors.error}`)
        .setFooter(footer),
    ],
    ephemeral: true,
  };
}
