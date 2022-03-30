import { colors, db, emojis, illustrations, misc } from '$lib/db';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import {
  EmbedField,
  Interaction,
  InteractionReplyOptions,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { RemindButton } from '../../modules/components/RemindButton';

dayjs.extend(relativeTime);

const handleError = (
  description: string,
  details?: string,
  fields?: EmbedField[],
  log?: boolean,
  title?: string
) => {
  if (log) {
    (getDiscordClient().channels.cache.get(misc.channels.errors) as TextChannel).send({
      embeds: [
        new MessageEmbed({
          description: `\`\`\`\n${details}\`\`\``,
          fields: fields || [],
          color: `#${colors.error}`,
        }),
      ],
    });
  }

  return new MessageEmbed({
    author: {
      iconURL: illustrations.error,
      name: title ?? description,
    },
    description: title ? description : null,
    fields: log ? [] : fields,
    color: `#${colors.error}`,
  });
};

export function CRBTError(
  desc: string,
  ephemeral = true,
  fields?: EmbedField[]
): InteractionReplyOptions {
  return { embeds: [handleError(desc, null, fields)], ephemeral };
}

export function UnknownError(context: Interaction, desc: string): InteractionReplyOptions {
  return {
    embeds: [
      handleError(
        `We have no clue what this issue may be. Here's what the error says:\n\`\`\`\n${desc}\`\`\`\nThis was reported to us, and we'll make sure to fix it as soon as possible!`,
        desc,
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
        true,
        'An unknown error has occurred'
      ),
    ],
    ephemeral: true,
  };
}

export async function CooldownError(
  context: Interaction,
  relativetime: number,
  showButton = true
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
        `You will be able to use this ${
          context.type === 'APPLICATION_COMMAND' ? 'command' : 'component'
        } ${dayjs(relativetime).fromNow()}...`
      ),
    ],
    components:
      showButton && reminder && Math.abs(reminder.expiration.getTime() - relativetime) < 60000
        ? components(
            row(
              new RemindButton({ relativetime, userId: context.user.id })
                .setStyle('SECONDARY')
                .setLabel('Add Reminder')
                .setEmoji(emojis.misc.reminder)
            )
          )
        : null,
    ephemeral: true,
  };
}
