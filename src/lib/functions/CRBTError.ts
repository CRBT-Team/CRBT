import { prisma } from '$lib/db';
import { channels, colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import { APIEmbed, APIEmbedField } from 'discord-api-types/v10';
import {
  Interaction,
  InteractionReplyOptions,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { RemindButton } from '../../modules/components/RemindButton';

const handleError = (
  i: Interaction,
  opts: {
    message: {
      title?: string;
      description?: string;
      fields?: APIEmbedField[];
    };
    error?: {
      error: any;
      context: string;
    };
  }
) => {
  const { message, error } = opts;

  const embed = new MessageEmbed().setColor(colors.error);

  if (error) {
    embed
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

    embed.setDescription(
      `${emojis.error} Error \`${message.title}\` was triggered on command \`${interactionName}\``
    );
  }

  (getDiscordClient().channels.cache.get(channels.errors) as TextChannel).send({
    embeds: [embed],
    files: [
      new MessageAttachment(
        Buffer.from(
          typeof i === 'object'
            ? JSON.stringify(
                i,
                (key, value) => (typeof value === 'bigint' ? value.toString() : value),
                2
              )
            : i
        ),
        'interaction.json'
      ),
    ],
  });

  return {
    title: `${emojis.error} ${message.title}`,
    description: message.description ?? '',
    fields: message.fields ?? [],
    color: colors.error,
  };
};

export function CRBTError(i: Interaction, embed: Partial<APIEmbed> | string, ephemeral = true) {
  if (!i.isRepliable()) return;

  const errorMessage = createCRBTError(i, embed, ephemeral);

  if (i.replied) {
    return i.editReply(errorMessage);
  } else {
    return i.reply(errorMessage);
  }
}

export const createCRBTError = (
  i: Interaction,
  embed: Partial<APIEmbed> | string,
  ephemeral = true
) => ({
  embeds: [
    handleError(i, {
      message: typeof embed === 'string' ? { title: embed } : embed,
    }),
  ],
  ephemeral,
});

export function UnknownError(i: any, error: any, context?: string, ephemeral = true) {
  const { strings } = t(i?.locale ?? 'en-US', 'UnknownError');

  if (!i.isRepliable()) return;

  console.error(error);

  const embed = handleError(i, {
    error: {
      error,
      context: context ?? String(i),
    },
    message: {
      title: strings.TITLE,
      description: strings.DESCRIPTION.replace('<MESSAGE>', `\`\`\`\n${error}\`\`\``),
    },
  });

  return {
    embeds: [embed],
    ephemeral,
  };
}

export async function CooldownError(
  context: Interaction,
  relativetime: number,
  showButton = true
): Promise<InteractionReplyOptions> {
  const { strings } = t(context.locale, 'CooldownError');
  const { ADD_REMINDER } = t(context.locale, 'genericButtons');

  const reminder = await prisma.reminder.findFirst({
    where: {
      id: { startsWith: `${context.user.id}-COMMAND-` },
    },
    orderBy: {
      expiresAt: 'desc',
    },
  });

  return {
    embeds: [
      handleError(context, {
        message: {
          title: strings.TITLE,
          description: strings.DESCRIPTION.replace(
            '<TYPE>',
            context.type === 'APPLICATION_COMMAND' ? strings.COMMAND : strings.COMPONENT
          ).replace('<TIME>', `<t:${dayjs(relativetime).unix()}:R>...`),
        },
      }),
    ],
    components:
      showButton && reminder && Math.abs(reminder.expiresAt.getTime() - relativetime) < 60000
        ? components(
            row(
              new RemindButton({ relativetime, userId: context.user.id })
                .setStyle('SECONDARY')
                .setLabel(ADD_REMINDER)
                .setEmoji(emojis.reminder)
            )
          )
        : null,
    ephemeral: true,
  };
}
