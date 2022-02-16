import { colors, emojis, illustrations, misc } from '$lib/db';
import dayjs from 'dayjs';
import {
  EmbedField,
  Interaction,
  InteractionReplyOptions,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { RemindButton } from '../../modules/specialButtons/RemindButton';

const handleError = (
  title: string,
  description: string,
  footer?: string,
  fields?: EmbedField[],
  log?: boolean
) => {
  if (log) {
    (getDiscordClient().channels.cache.get(misc.channels.errors) as TextChannel).send({
      embeds: [
        new MessageEmbed({
          author: {
            iconURL: illustrations.error,
            name: title,
          },
          description: title.includes('generic') ? description.split('\n')[0] : description,
          fields: fields || [],
          color: `#${colors.error}`,
        }),
      ],
    });
  }

  return new MessageEmbed({
    author: {
      iconURL: illustrations.error,
      name: title,
    },
    description,
    footer: {
      text: footer,
    },
    color: `#${colors.error}`,
  });
};

export function CRBTError(
  desc: string,
  title: string = 'An error occured!',
  footer: string = ''
): InteractionReplyOptions {
  return { embeds: [handleError(title, desc, footer)], ephemeral: true };
}

export function UnknownError(context: Interaction, desc: string): InteractionReplyOptions {
  return {
    embeds: [
      handleError(
        'Oh no! A generic error!',
        `We have no clue what this issue may be. Here's what the error says:\n${desc}\n\nThis was reported to us, and we'll make sure to fix it as soon as possible!`,
        null,
        [
          {
            name: 'Context',
            value: context.toString(),
            inline: false,
          },
          {
            name: 'User ID',
            value: context.user.id,
            inline: false,
          },
        ]
      ),
    ],
    ephemeral: true,
  };
}

export function CooldownError(relativetime: number): InteractionReplyOptions {
  return {
    embeds: [
      handleError(
        'Hold up!',
        `You will be able to use this command <t:${dayjs(relativetime).unix()}:R>...`
      ),
    ],
    components: components(
      row(
        new RemindButton(relativetime)
          .setStyle('SECONDARY')
          .setLabel('Add Reminder')
          .setEmoji(emojis.misc.reminder)
      )
    ),
    ephemeral: true,
  };
}
