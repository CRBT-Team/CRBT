import { prisma } from '$lib/db';
import { channels, colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { ReminderTypes } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import {
  Interaction,
  InteractionReplyOptions,
  MessageAttachment,
  MessageEmbed,
  MessageEmbedOptions,
  TextChannel,
} from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { RemindButton } from '../../modules/components/RemindButton';
import { slashCmd } from './commandMention';

function handleError(
  i: Interaction,
  opts: {
    embed: Partial<MessageEmbedOptions>;
    error?: {
      error: any;
      context: string;
    };
    sendLog?: boolean;
  },
): MessageEmbedOptions {
  const { embed, error, sendLog } = opts;

  const devEmbed = new MessageEmbed().setColor(colors.error);

  if (error) {
    devEmbed
      .setDescription(error ? `\`\`\`\n${error.error}\`\`\`` : '')
      .addFields({ name: 'Context', value: `\`\`\`\n${error.context}\`\`\``, inline: true });
  } else {
    let interactionName: string;

    if (i.isCommand()) {
      interactionName = i.toString();
    } else if (i.isButton()) {
      interactionName = i.component.label;
    } else if (i.isContextMenu()) {
      interactionName = i.commandName;
    } else if (i.isModalSubmit()) {
      interactionName = `Modal`;
    } else {
      interactionName = `${i}`;
    }

    devEmbed.setDescription(
      `${emojis.error} Error \`${embed.title}\` was triggered on command \`${interactionName}\``,
    );
  }

  if (sendLog) {
    (getDiscordClient().channels.cache.get(channels.errors) as TextChannel).send({
      embeds: [devEmbed],
      files: [
        new MessageAttachment(
          Buffer.from(
            typeof i === 'object'
              ? JSON.stringify(
                  i,
                  (key, value) => (typeof value === 'bigint' ? value.toString() : value),
                  2,
                )
              : i,
          ),
          'interaction.json',
        ),
      ],
    });
  }

  return {
    ...embed,
    title: `${emojis.error} ${embed.title}`,
    color: colors.error,
  };
}

export async function CRBTError(
  i: Interaction,
  embed: MessageEmbedOptions | string,
  ephemeral = true,
) {
  if (!i.isRepliable()) return;

  const errorMessage = createCRBTError(i, embed, ephemeral);

  if (i.replied) {
    return i.editReply(errorMessage);
  } else {
    try {
      return await i.reply(errorMessage);
    } catch (e) {
      return await i.editReply(errorMessage);
    }
  }
}

export function createCRBTError(
  i: Interaction,
  embed: Partial<MessageEmbedOptions> | string,
  ephemeral = true,
): InteractionReplyOptions {
  return {
    embeds: [
      handleError(i, {
        embed: typeof embed === 'string' ? { title: embed } : embed,
        sendLog: true,
      }),
    ],
    ephemeral,
    components: [],
  };
}

export function UnknownError(i: any, error: any, context?: string, ephemeral = true) {
  const { strings } = t(i?.locale ?? 'en-US', 'UnknownError');

  console.error(error);

  const embed = handleError(i, {
    error: {
      error,
      context: context ?? String(i),
    },
    sendLog: true,
    embed: {
      title: strings.TITLE,
      description: strings.DESCRIPTION.replace('{reportCommand}', slashCmd('report')).replace(
        '{MESSAGE}',
        `\`\`\`\n${error}\`\`\``,
      ),
    },
  });

  if (i instanceof Interaction && !i.isRepliable()) return;

  return {
    embeds: [embed],
    ephemeral,
    components: [],
  };
}

export async function CooldownError(
  context: Interaction,
  timestamp: number,
  showButton = true,
): Promise<InteractionReplyOptions> {
  const reminder = await prisma.reminder.findFirst({
    where: {
      AND: {
        userId: context.user.id,
        type: ReminderTypes.COMMAND,
        endDate: new Date(timestamp),
      },
    },
    orderBy: {
      endDate: 'desc',
    },
  });

  return {
    embeds: [
      handleError(context, {
        embed: {
          title: t(context.locale, 'CooldownError.TITLE'),
          description: t(context.locale, 'CooldownError.DESCRIPTION', {
            time: timestampMention(timestamp, 'R'),
          }),
        },
        sendLog: false,
      }),
    ],
    components:
      showButton && !reminder
        ? components(
            row(
              new RemindButton({ relativetime: timestamp, userId: context.user.id })
                .setStyle('SECONDARY')
                .setLabel(t(context, 'SET_REMINDER'))
                .setEmoji(emojis.reminder),
            ),
          )
        : null,
    ephemeral: true,
  };
}
