import { colors, db, emojis, illustrations, misc } from '$lib/db';
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
          description: title.includes('generic')
            ? `\`\`\`\n${description.split('\n').slice(1).join('\n')}\`\`\``
            : description,
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
    fields: log ? [] : fields,
    color: `#${colors.error}`,
  });
};

export function CRBTError(
  desc: string,
  title = 'An error occured!',
  footer = '',
  ephemeral = true,
  fields?: EmbedField[]
): InteractionReplyOptions {
  return { embeds: [handleError(title, desc, footer, fields)], ephemeral };
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
            value: `\`\`\`\n${context.toString()}\`\`\``,
            inline: false,
          },
          {
            name: 'User ID',
            value: `\`\`\`\n${context.user.id}\`\`\``,
            inline: false,
          },
        ],
        true
      ),
    ],
    ephemeral: true,
  };
}

export async function CooldownError(
  context: Interaction,
  relativetime: number
): Promise<InteractionReplyOptions> {
  const reminder = await db.reminders.findFirst({
    where: {
      user_id: context.user.id,
      destination: 'dm',
      reminder: 'Command reminder from CRBT.',
    },
    orderBy: {
      expiration: 'desc',
    },
  });

  return {
    embeds: [
      handleError(
        'Hold up!',
        `You will be able to use this command <t:${dayjs(relativetime).unix()}:R>...`
      ),
    ],
    components:
      reminder && Math.abs(reminder.expiration.getTime() - relativetime) < 60000
        ? null
        : components(
            row(
              new RemindButton({ relativetime, userId: context.user.id })
                .setStyle('SECONDARY')
                .setLabel('Add Reminder')
                .setEmoji(emojis.misc.reminder)
            )
          ),
    ephemeral: true,
  };
}
