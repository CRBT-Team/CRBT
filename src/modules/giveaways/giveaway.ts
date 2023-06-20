import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { prisma } from '$lib/db';
import { colors, emojis, icons } from '$lib/env';
import { CRBTError, createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { trimArray } from '$lib/functions/trimArray';
import { getAllLanguages, t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { Giveaway } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import dedent from 'dedent';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Message, MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';

const activeGiveaways = new Map<string, Giveaway>();

export default ChatCommand({
  name: 'giveaway',
  description: t('en-US', 'giveaway.description'),
  nameLocalizations: getAllLanguages('GIVEAWAY', localeLower),
  descriptionLocalizations: getAllLanguages('giveaway.description'),
  allowInDMs: false,
  options: new OptionBuilder()
    .string('prize', t('en-US', 'PRIZE').toLowerCase(), {
      nameLocalizations: getAllLanguages('PRIZE', localeLower),
      descriptionLocalizations: getAllLanguages('giveaway.options.prize.description'),
      required: true,
      maxLength: 100,
    })
    .string('end_date', t('en-US', 'END_DATE').toLowerCase(), {
      nameLocalizations: getAllLanguages('END_DATE', localeLower),
      descriptionLocalizations: getAllLanguages('giveaway.options.end_date.description'),
      autocomplete({ end_date }) {
        return timeAutocomplete.call(this, end_date, '2M', '20s');
      },
      required: true,
    })
    .integer('winners', t('en-US', 'WINNERS').toLowerCase(), {
      nameLocalizations: getAllLanguages('WINNERS', localeLower),
      descriptionLocalizations: getAllLanguages('giveaway.options.winners.description'),
      minValue: 1,
      maxValue: 40,
    }),
  async handle({ prize, end_date, winners }) {
    await this.deferReply({
      ephemeral: true,
    });

    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return CRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS', {
          permissions: '"Manage Server"',
        })
      );
    }

    if (!isValidTime(end_date) && ms(end_date) > ms('1M')) {
      return CRBTError(this, 'Invalid duration or exceeds 1 month.');
    }

    winners ||= 1;

    try {
      const end = new Date(Date.now() + ms(end_date));

      const msg = await this.channel.send({
        embeds: [
          {
            author: {
              name: t(this.guildLocale, 'GIVEAWAY'),
              iconURL: icons.giveaway,
            },
            title: prize,
            description: dedent`
            Ends ${timestampMention(end)} • ${timestampMention(end, 'R')}
            Hosted by <@${this.user.id}>`,
            fields: [
              {
                name: 'Entrants',
                value: '0',
                inline: true,
              },
              {
                name: t(this.guildLocale, 'WINNERS'),
                value: winners.toLocaleString(this.guildLocale),
                inline: true,
              },
            ],
            color: await getColor(this.guild),
          },
        ],
        components: components(
          row(
            new EnterGwayButton().setStyle('PRIMARY').setEmoji(emojis.tada).setLabel('Enter'),
            new GwayOptionsButton().setEmoji(emojis.buttons.menu).setStyle('SECONDARY')
          )
        ),
      });

      const data = await dbTimeout(TimeoutTypes.Giveaway, {
        id: `${this.channel.id}/${msg.id}`,
        expiresAt: end,
        serverId: this.guildId,
        locale: this.guildLocale,
        hostId: this.user.id,
        participants: [],
      });

      activeGiveaways.set(`${this.channel.id}/${msg.id}`, data);

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} Giveaway started!`,
            description: `It will end  ${timestampMention(
              end,
              'R'
            )}, but you can prematurely end it by using the ${
              emojis.menu
            } menu. From this menu, you can also cancel it or view the entrants.`,
            color: colors.success,
          },
        ],
      });
    } catch (error) {
      this.editReply(UnknownError(this, String(error)));
    }
  },
});

async function getGiveawayData(i: MessageComponentInteraction | string) {
  const id = typeof i === 'string' ? i : `${i.channelId}/${i.message.id}`;
  return (
    activeGiveaways.get(id) ??
    (await prisma.giveaway.findFirst({
      where: { id },
    }))
  );
}

async function updateGiveaway(i: MessageComponentInteraction | string, gway: Giveaway) {
  const id = typeof i === 'string' ? i : `${i.channelId}/${i.message.id}`;
  activeGiveaways.set(id, gway);
  return await prisma.giveaway.update({
    where: { id },
    data: { ...gway },
  });
}

export const GwayOptionsButton = ButtonComponent({
  async handle() {
    const { strings } = t(this, 'poll');

    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return CRBTError(
        this,
        'Only managers ("Manage Server" permission) can manage this giveaway.'
      );
    }

    const gwayData = await getGiveawayData(this);

    await this.reply({
      embeds: [
        {
          title: `${t(this, 'GIVEAWAY')} - ${strings.DATA_AND_OPTIONS}`,
          fields: [
            {
              name: `Entrants (${gwayData.participants.length})`,
              value: gwayData.participants.length
                ? trimArray(
                    gwayData.participants.map((id) => `<@${id}>`),
                    this.locale,
                    15
                  ).join(', ')
                : `*${t(this, 'NONE')}*`,
            },
          ],
          footer: {
            text: strings.POLL_DATA_FOOTER,
          },
          color: await getColor(this.guild),
        },
      ],
      components: components(
        row(
          new EndGwayButton(this.message.id)
            .setLabel(t(this, 'END_NOW'))
            .setEmoji(emojis.buttons.cross)
            .setStyle('DANGER'),
          new CancelGwayButton(this.message.id)
            .setLabel(t(this, 'CANCEL'))
            .setEmoji(emojis.buttons.trash_bin)
            .setStyle('DANGER')
        )
      ),
      ephemeral: true,
    });
  },
});

export const CancelGwayButton = ButtonComponent({
  async handle(msgId: string) {
    try {
      await prisma.giveaway.delete({
        where: { id: `${this.channel.id}/${msgId}` },
      });

      const msg = await this.channel.messages.fetch(msgId);
      await msg.delete();

      await this.update({
        embeds: [
          {
            title: `${emojis.success} Giveaway deleted.`,
            color: colors.success,
          },
        ],
        components: [],
      });
    } catch (err) {
      UnknownError(this, err);
    }
  },
});

export const EndGwayButton = ButtonComponent({
  async handle(msgId: string) {
    const gwayData = await getGiveawayData(`${this.channelId}/${msgId}`);

    if (gwayData) {
      const msg = await this.channel.messages.fetch(msgId);
      await endGiveaway(gwayData, msg);
    }

    await this.update({
      embeds: [
        {
          title: `${emojis.success} Ended giveaway`,
          color: colors.success,
        },
      ],
      components: [],
    });
  },
});

export const ExitGwayButton = ButtonComponent({
  async handle(messageId: string) {
    const id = `${this.channelId}/${messageId}`;
    const gwayData = await getGiveawayData(id);
    gwayData.participants = gwayData.participants.filter((i) => i !== this.user.id);
    const msg = await this.channel.messages.fetch(messageId);

    updateGiveaway(id, gwayData);

    await this.update({
      embeds: [
        {
          title: `${emojis.success} You left the giveaway.`,
          color: colors.success,
        },
      ],
      components: [],
    });

    msg.edit({
      embeds: [
        {
          ...msg.embeds[0],
          fields: [
            {
              ...msg.embeds[0].fields[0],
              value: msg.embeds[0].fields[0].value.replace(
                /\d+/,
                (match) => `${parseInt(match) - 1}`
              ),
            },
            ...(msg.embeds[0].fields.slice(1) as any[]),
          ],
        },
      ],
    });
  },
});

export const EnterGwayButton = ButtonComponent({
  async handle() {
    const giveaway = await getGiveawayData(this);

    if (giveaway.participants.includes(this.user.id)) {
      return this.reply({
        ...createCRBTError(this, 'You have already entered this giveaway.'),
        components: components(
          row(
            new ExitGwayButton(this.message.id)
              .setLabel('Leave Giveaway')
              .setEmoji(emojis.buttons.cross)
              .setStyle('DANGER')
          )
        ),
      });
    }

    giveaway.participants.push(this.user.id);

    updateGiveaway(this, giveaway);

    this.update({
      embeds: [
        {
          ...this.message.embeds[0],
          fields: [
            {
              ...this.message.embeds[0].fields[0],
              value: this.message.embeds[0].fields[0].value.replace(
                /\d+/,
                (match) => `${parseInt(match) + 1}`
              ),
            },
            ...(this.message.embeds[0].fields.slice(1) as any[]),
          ],
        },
      ],
    });
  },
});

export const endGiveaway = async (giveaway: Giveaway, gwayMsg: Message) => {
  const winnersAmount = Number(gwayMsg.embeds[0].fields[1].value);

  const winners = giveaway.participants.sort(() => 0.5 - Math.random()).slice(0, winnersAmount);
  const prize = gwayMsg.embeds[0].title;

  await gwayMsg.edit({
    embeds: [
      new MessageEmbed({
        ...gwayMsg.embeds[0],
      })
        .setAuthor({
          name: 'Giveaway Ended',
          iconURL: icons.giveaway,
        })
        .setDescription(
          `Ended <t:${dayjs().unix()}> (<t:${dayjs().unix()}:R>)\n${
            winners.length === 1
              ? `Winner: <@${winners[0]}>`
              : `Winners: ${winners.map((id) => `<@${id}>`).join(', ')}`
          }\n${gwayMsg.embeds[0].description.split('\n').at(-1)}`
        )
        .setColor(colors.gray),
    ],
    components: [],
  });

  await gwayMsg.reply({
    allowedMentions: {
      users: winners,
    },
    content: winners.map((id) => `<@${id}>`).join(' '),
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: 'Congratulations!',
          iconURL: icons.giveaway,
        })
        .setDescription(`${winners.map((id) => `<@${id}>`).join(', ')} won **${prize}**!`)
        .setColor(colors.success),
    ],
    components: components(
      row(
        new MessageButton()
          .setStyle('LINK')
          .setURL(gwayMsg.url)
          .setLabel(t(giveaway.locale, 'JUMP_TO_MSG'))
      )
    ),
  });

  await prisma.giveaway.delete({
    where: { id: giveaway.id },
  });
  activeGiveaways.delete(giveaway.id);
};
