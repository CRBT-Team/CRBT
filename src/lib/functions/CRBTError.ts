import { colors, db, emojis, illustrations, misc } from '$lib/db';
import { languages } from '$lib/language';
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
  const { strings } = languages[context.locale].UnknownError;
  return {
    embeds: [
      handleError(
        strings.DESCRIPTION.replace('<MESSAGE>', `\`\`\`\n${desc}\`\`\``),
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
  const { strings } = languages[context.locale].CooldownError;
  const { ADD_REMINDER } = languages[context.locale].genericButtons;

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
        strings.DESCRIPTION.replace(
          '<TYPE>',
          context.type === 'APPLICATION_COMMAND' ? 'command' : 'component'
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
              new RemindButton({ relativetime, userId: context.user.id })
                .setStyle('SECONDARY')
                .setLabel(ADD_REMINDER)
                .setEmoji(emojis.misc.reminder)
            )
          )
        : null,
    ephemeral: true,
  };
}
