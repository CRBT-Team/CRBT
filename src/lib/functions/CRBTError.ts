import { colors, db, emojis, misc } from '$lib/db';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import {
  EmbedField,
  Interaction,
  InteractionReplyOptions,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { RemindButton } from '../../modules/components/RemindButton';

const handleError = (opts: {
  message: string;
  detail?: {
    title?: string;
    description?: string;
    fields?: EmbedField[];
  };
  error?: {
    interaction: any;
    error: any;
    context: string;
  };
}) => {
  const { message, detail, error } = opts;

  if (error) {
    (getDiscordClient().channels.cache.get(misc.channels.errors) as TextChannel).send({
      embeds: [
        new MessageEmbed()
          .setDescription(`\`\`\`\n${error.error}\`\`\``)
          .addField('Context', `\`\`\`\n${error.context}\`\`\``, true)
          .setColor(`#${colors.error}`),
      ],
      files: [
        new MessageAttachment(
          Buffer.from(
            typeof error.interaction === 'object'
              ? JSON.stringify(
                  error.interaction,
                  (key, value) => (typeof value === 'bigint' ? value.toString() : value),
                  2
                )
              : error.interaction
          ),
          'interaction.json'
        ),
      ],
    });
  }

  return new MessageEmbed()
    .setTitle(`${emojis.error} ${detail?.title ?? message}`)
    .setDescription(detail?.title ? detail?.description ?? message : '')
    .setFields(detail?.fields ?? [])
    .setColor(`#${colors.error}`);
};

export function CRBTError(
  message: string,
  ephemeral = true,
  fields?: EmbedField[]
): InteractionReplyOptions {
  return {
    embeds: [
      handleError({
        message,
        detail: { fields },
      }),
    ],
    ephemeral,
  };
}

export function UnknownError(i: any, error: any, context?: string, ephemeral = true) {
  const { strings } = t(i?.locale ?? 'en-US', 'UnknownError');

  console.error(error);

  const embed = handleError({
    message: strings.DESCRIPTION.replace('<MESSAGE>', `\`\`\`\n${error}\`\`\``),
    error: {
      interaction: i,
      error,
      context: context ?? String(i),
    },
    detail: { title: strings.TITLE },
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

  const reminder = await db.timeouts.findFirst({
    where: {
      type: 'REMINDER',
      id: { startsWith: `${context.user.id}-COMMAND-` },
    },
    orderBy: {
      expiration: 'desc',
    },
  });

  return {
    embeds: [
      handleError({
        message: strings.DESCRIPTION.replace(
          '<TYPE>',
          context.type === 'APPLICATION_COMMAND' ? strings.COMMAND : strings.COMPONENT
        ).replace('<TIME>', `<t:${dayjs(relativetime).unix()}:R>...`),
        detail: { title: strings.TITLE },
      }),
    ],
    components:
      showButton && reminder && Math.abs(reminder.expiration.getTime() - relativetime) < 60000
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
