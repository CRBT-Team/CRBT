import { prisma } from '$lib/db';
import { channels, colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import dayjs from 'dayjs';
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

function handleError(
  i: Interaction,
  opts: {
    embed: Partial<MessageEmbedOptions>;
    error?: {
      error: any;
      context: string;
    };
  }
): MessageEmbedOptions {
  const { embed, error } = opts;

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
      `${emojis.error} Error \`${embed.title}\` was triggered on command \`${interactionName}\``
    );
  }

  (getDiscordClient().channels.cache.get(channels.errors) as TextChannel).send({
    embeds: [devEmbed],
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
    ...embed,
    title: `${emojis.error} ${embed.title}`,
    color: colors.error,
  };
}

export function CRBTError(i: Interaction, embed: MessageEmbedOptions | string, ephemeral = true) {
  if (!i.isRepliable()) return;

  const errorMessage = createCRBTError(i, embed, ephemeral);

  if (i.replied) {
    return i.editReply(errorMessage);
  } else {
    return i.reply(errorMessage);
  }
}

export function createCRBTError(
  i: Interaction,
  embed: Partial<MessageEmbedOptions> | string,
  ephemeral = true
): InteractionReplyOptions {
  return {
    embeds: [
      handleError(i, {
        embed: typeof embed === 'string' ? { title: embed } : embed,
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
    embed: {
      title: strings.TITLE,
      description: strings.DESCRIPTION.replace('{MESSAGE}', `\`\`\`\n${error}\`\`\``),
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
        embed: {
          title: strings.TITLE,
          description: strings.DESCRIPTION.replace(
            '{TYPE}',
            context.type === 'APPLICATION_COMMAND' ? strings.COMMAND : strings.COMPONENT
          ).replace('{TIME}', `<t:${dayjs(relativetime).unix()}:R>...`),
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
