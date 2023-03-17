import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { progressBar } from '$lib/functions/progressBar';
import { t } from '$lib/language';
import { Poll } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import { Interaction, MessageEmbed, MessageOptions } from 'discord.js';
import { getSettings } from '../../settings/serverSettings/_helpers';
import { parseOptionName } from '../_helpers';

export async function handleVote(
  this: Interaction,
  choiceId: string,
  poll: Poll,
  previousEmbed: MessageEmbed
) {
  const choices = poll.choices as string[][];
  const newChoiceId = Number(choiceId);
  const previousChoiceId = choices.findIndex((choice) =>
    choice.find((voter) => voter === this.user.id)
  );

  if (previousChoiceId !== -1) {
    choices[previousChoiceId]?.splice(
      choices[previousChoiceId].findIndex((voter) => voter === this.user.id),
      1
    );
  }
  if (previousChoiceId !== newChoiceId) {
    choices[newChoiceId]?.push(this.user.id);
  }

  await fetchWithCache(
    `poll:${poll.id}`,
    () =>
      prisma.poll.update({
        where: { id: poll.id },
        data: { ...poll, choices },
      }),
    true
  );

  return renderPoll.call(this, poll, previousEmbed);
}

interface PollRenderProps {
  title: string;
  choices: string[];
  editedAt?: Date;
}

export async function renderPoll(
  this: Interaction,
  poll: Partial<Poll>,
  previousEmbed?: MessageEmbed | null,
  options?: PollRenderProps
): Promise<Omit<MessageOptions, 'flags'>> {
  const { accentColor } = await getSettings(this.guildId);
  const totalVotes = poll.choices.flat().length;
  const choices = poll.choices as string[][];

  return {
    content:
      t(this.guildLocale, 'poll.strings.POLL_FOOTER_CREATOR', {
        user: `<@${poll.creatorId}>`,
      }) + (options?.editedAt ? ` (edited ${timestampMention(options.editedAt, 'd')})` : ''),
    embeds: [
      {
        title: options?.title,
        description: t(this.guildLocale, 'poll.strings.POLL_DESCRIPTION', {
          TIME: timestampMention(poll.expiresAt, 'R'),
          ICON: emojis.menu,
        }),
        color: accentColor,
        ...previousEmbed,
        fields: choices.map(({ length: votes }, index) => {
          let percentage = Math.round((votes / totalVotes) * 100);
          if (isNaN(percentage)) percentage = 0;
          if (percentage === Infinity) percentage = 100;
          const label = options
            ? options.choices[index]
            : parseOptionName(previousEmbed.fields[index].name);

          return {
            name: `${label} • ${percentage}% (${votes.toLocaleString(this.locale)})`,
            value: progressBar(percentage, accentColor),
            inline: false,
          };
        }),
      },
    ],
  };
}
