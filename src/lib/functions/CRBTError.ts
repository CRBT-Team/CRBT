import { colors, db, emojis, icons, misc } from '$lib/db';
import { getStrings } from '$lib/language';
import dayjs from 'dayjs';
import {
  EmbedField,
  Interaction,
  InteractionReplyOptions,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { RemindButton } from '../../modules/components/RemindButton';

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
      iconURL: icons.error,
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

export function UnknownError(context: Interaction, desc: any): InteractionReplyOptions {
  const { strings } = getStrings(context.locale, 'UnknownError');
  console.error(desc);
  return {
    embeds: [
      handleError(
        strings.DESCRIPTION.replace('<MESSAGE>', `\`\`\`\n${desc}\`\`\``),
        String(desc),
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
        strings.TITLE
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
  const { strings } = getStrings(context.locale, 'CooldownError');
  const { ADD_REMINDER } = getStrings(context.locale, 'genericButtons');

  const reminder = await db.reminders.findFirst({
    where: {
      userId: context.user.id,
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
        strings.DESCRIPTION.replace(
          '<TYPE>',
          context.type === 'APPLICATION_COMMAND' ? strings.COMMAND : strings.COMPONENT
        ).replace('<TIME>', `<t:${dayjs(relativetime).unix()}:R>...`),
        null,
        null,
        false,
        strings.TITLE
      ),
    ],
    components:
      showButton && reminder && Math.abs(reminder.expiration.getTime() - relativetime) < 60000
        ? components(
            row(
              new RemindButton({ relativetime, userId: context.user.id, locale: context.locale })
                .setStyle('SECONDARY')
                .setLabel(ADD_REMINDER)
                .setEmoji(emojis.reminder)
            )
          )
        : null,
    ephemeral: true,
  };
}
