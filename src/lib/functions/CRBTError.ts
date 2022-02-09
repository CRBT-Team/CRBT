import { colors, illustrations, misc } from '$lib/db';
import { CommandInteraction, InteractionReplyOptions, MessageEmbed, TextChannel } from 'discord.js';
import { getDiscordClient } from 'purplet';
// import { getFullCommand } from '../../modules/events/interaction';

export function CRBTError(
  context: CommandInteraction | null,
  desc: string = '',
  title: string = 'An error occured!',
  footer: string = ''
): InteractionReplyOptions {
  if (context) {
    (getDiscordClient().channels.cache.get(misc.channels.errors) as TextChannel).send({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'An error occured!', iconURL: illustrations.error })
          .setDescription(`\`\`\`\n${desc}\`\`\``)
          .addField('Command', `\`\`\`\n${context}\`\`\``)
          .addField('User ID', context?.user.id)
          .setColor(`#${colors.error}`),
      ],
    });
  }

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: title, iconURL: illustrations.error })
        .setDescription(desc)
        .setColor(`#${colors.error}`)
        .setFooter({ text: footer }),
    ],
    ephemeral: true,
  };
}
