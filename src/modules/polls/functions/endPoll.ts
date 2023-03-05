import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { Poll } from '@prisma/client';
import dedent from 'dedent';
import { Message, MessageButton } from 'discord.js';
import { components, row } from 'purplet';

export const endPoll = async (poll: Poll, pollMsg: Message) => {
  const choices = poll.choices as string[][];
  const totalVotes = choices.flat().length;
  const ranking = choices
    .map((choice, index) => {
      const votes = choice.length;
      return { name: pollMsg.embeds[0].fields[index].name, votes };
    })
    .sort((a, b) => b.votes - a.votes);
  const winners = ranking.filter((place) => place.votes === ranking[0].votes);

  await pollMsg.reply({
    embeds: [
      {
        title: `${emojis.tada} ${t(poll.locale, 'poll.strings.POLL_RESULTS_TITLE')}`,
        description: dedent`
        ${
          winners.length > 1
            ? t(poll.locale, 'poll.strings.POLL_RESULTS_DESCRIPTION_TIE', {
                OPTION1: ranking[0].name,
                OPTION2: winners
                  .slice(1)
                  .map((winner) => winner.name)
                  .join(', '),
                VOTES: ranking[0].votes.toLocaleString(poll.locale),
              })
            : t(poll.locale, 'poll.strings.POLL_RESULTS_DESCRIPTION_WIN', {
                OPTION: `${ranking[0].name}`,
                VOTES: ranking[0].votes.toLocaleString(poll.locale),
              })
        } ${t(poll.locale, 'poll.strings.POLL_RESULTS_DESCRIPTION_REST', {
          TOTAL: totalVotes.toLocaleString(poll.locale),
        })}
        `,
        color: colors.success,
      },
    ],
    components: components(
      row(
        new MessageButton({
          style: 'LINK',
          label: t(poll.locale, 'JUMP_TO_MSG'),
          url: pollMsg.url,
        })
      )
    ),
  });

  await pollMsg.edit({
    embeds: [
      {
        ...pollMsg.embeds[0],
        description: t(poll.locale, 'poll.strings.POLL_DESCRIPTION_ENDED'),
        fields: pollMsg.embeds[0].fields.map((field) => {
          if (winners.map(({ name }) => name).includes(field.name)) {
            return {
              name: `🏆 ${field.name}`,
              value: field.value,
              inline: false,
            };
          }
          return field;
        }),
        color: colors.gray,
      },
    ],
    components: [],
  });

  cache.del(`poll:${poll.id}`);

  await prisma.poll.delete({
    where: { id: poll.id },
  });
};
