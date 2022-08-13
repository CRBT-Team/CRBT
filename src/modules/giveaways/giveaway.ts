import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { colors, db, emojis, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { isValidTime, ms } from '$lib/functions/ms';
import { t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { GiveawayData, TimeoutTypes } from '$lib/types/timeouts';
import dayjs from 'dayjs';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Message, MessageButton, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';

const activeGiveaways = new Map<string, GiveawayData>();

export default ChatCommand({
  name: 'giveaway',
  description: 'Create a giveaway.',
  allowInDMs: false,
  options: new OptionBuilder()
    .string('prize', 'What to giveaway.', {
      required: true,
      maxLength: 100,
    })
    .string('end_date', 'When to end the giveaway.', {
      autocomplete({ end_date }) {
        return timeAutocomplete.call(this, end_date, '2M', '20s');
      },
      required: true,
    })
    .integer('winners', 'How many people can win (up to 40).', {
      minValue: 1,
      maxValue: 40,
    }),
  async handle({ prize, end_date, winners }) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return this.reply(
        CRBTError('Only managers ("Manage Server" permission) can create giveaways.')
      );
    }

    if (!isValidTime(end_date) && ms(end_date) > ms('1M')) {
      return this.reply(CRBTError('Invalid duration or exceeds 1 month in the future.'));
    }

    winners = winners || 1;

    try {
      const end = dayjs().add(ms(end_date));

      const msg = await this.channel.send({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Giveaway',
              iconURL: icons.giveaway,
            })
            .setTitle(prize)
            .setDescription(`Ends <t:${end.unix()}> (<t:${end.unix()}:R>)\nHosted by ${this.user}`)
            .addField('Entrants', `0`, true)
            .addField('Winners', `${winners}`, true)
            .setColor(`#${colors.default}`),
        ],
        components: components(
          row(
            new EnterGwayButton().setStyle('PRIMARY').setEmoji(emojis.tada).setLabel('Enter'),
            new GwayOptionsButton().setEmoji(emojis.buttons.menu).setStyle('SECONDARY')
          )
        ),
      });

      const data = await dbTimeout({
        id: `${this.channel.id}/${msg.id}`,
        type: TimeoutTypes.Giveaway,
        expiration: end.toDate(),
        locale: this.guildLocale,
        data: {
          creatorId: this.user.id,
          participants: [],
        },
      });

      activeGiveaways.set(`${this.channel.id}/${msg.id}`, data);

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Giveaway started!',
              iconURL: icons.success,
            })
            .setDescription(
              `It will end <t:${end.unix()}:R>, but you can prematurely end it by using the ${
                emojis.menu
              } menu. From this menu, you can also cancel it or view the entrants.`
            )
            .setColor(`#${colors.success}`),
        ],
        ephemeral: true,
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});

async function getGiveawayData(id: string) {
  return (
    activeGiveaways.get(id) ??
    ((await db.timeouts.findFirst({
      where: { id },
    })) as GiveawayData)
  );
}

export const GwayOptionsButton = ButtonComponent({
  async handle() {
    const { strings } = t(this, 'poll');

    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return this.reply(
        CRBTError('Only managers ("Manage Server" permission) can manage this giveaway.')
      );
    }

    const gwayData = await getGiveawayData(`${this.channelId}/${this.message.id}`);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'CRBT Giveaway • Data and Options',
          })
          .addField(
            `Entrants (${gwayData.data.participants.length})`,
            gwayData.data.participants.map((id) => `<@${id}>`).join(', ') || 'None'
          )
          .setFooter({
            text: strings.POLL_DATA_FOOTER,
          })
          .setColor(`#${colors.default}`),
      ],
      components: components(
        row(
          new EndGwayButton(this.message.id)
            .setLabel('End Giveaway')
            .setEmoji(emojis.buttons.cross)
            .setStyle('DANGER'),
          new CancelGwayButton(this.message.id)
            .setLabel('Cancel Giveaway')
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
      await db.timeouts.delete({
        where: { id: `${this.channel.id}/${msgId}` },
      });

      const msg = await this.channel.messages.fetch(msgId);
      await msg.delete();

      await this.update({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              iconURL: icons.success,
              name: 'Giveaway deleted.',
            })
            .setColor(`#${colors.success}`),
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
      await endGiveaway(gwayData.data, msg, this.guildLocale);
    }

    await this.update({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Ended Giveaway',
            iconURL: icons.success,
          })
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });
  },
});

export const EnterGwayButton = ButtonComponent({
  async handle() {
    const gwayData = await getGiveawayData(`${this.channelId}/${this.message.id}`);
    const participants = gwayData.data.participants;

    if (participants.includes(this.user.id)) {
      return this.reply(CRBTError('You have already entered this giveaway.'));
    }

    participants.push(this.user.id);

    (await db.timeouts.update({
      where: { id: gwayData.id },
      data: { data: { ...gwayData.data, participants } },
    })) as GiveawayData;

    this.update({
      embeds: [
        new MessageEmbed({
          ...this.message.embeds[0],
          fields: [],
        })
          .addField(
            this.message.embeds[0].fields[0].name,
            this.message.embeds[0].fields[0].value.replace(
              /\d+/,
              (match) => `${parseInt(match) + 1}`
            ),
            true
          )
          .addField(
            this.message.embeds[0].fields[1].name,
            this.message.embeds[0].fields[1].value,
            true
          ),
      ],
    });
  },
});

export const endGiveaway = async (
  gwayData: GiveawayData['data'],
  gwayMsg: Message,
  locale: string
) => {
  const { JUMP_TO_MSG } = t(locale, 'genericButtons');
  const winnersAmount = Number(gwayMsg.embeds[0].fields[1].value);

  const winners = gwayData.participants.sort(() => 0.5 - Math.random()).slice(0, winnersAmount);
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
        .setColor(`#${colors.gray}`),
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
        .setColor(`#${colors.success}`),
    ],
    components: components(
      row(new MessageButton().setStyle('LINK').setURL(gwayMsg.url).setLabel(JUMP_TO_MSG))
    ),
  });

  await db.timeouts.delete({
    where: { id: `${gwayMsg.channelId}/${gwayMsg.id}` },
  });

  activeGiveaways.delete(`${gwayMsg.channelId}/${gwayMsg.id}`);
};
