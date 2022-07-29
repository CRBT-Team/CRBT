import { cache } from '$lib/cache';
import { db, emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { FullDBTimeout } from '$lib/functions/setDbTimeout';
import { snowStamp } from '$lib/functions/snowStamp';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import {
  ButtonInteraction,
  CommandInteraction,
  MessageButton,
  MessageEmbed,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextChannel,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  row,
  SelectMenuComponent,
} from 'purplet';
import { allCommands } from '../events/ready';

export default ChatCommand({
  name: 'reminder list',
  description: 'Get a list of all of your reminders.',
  async handle() {
    const userReminders = (
      (await db.timeouts.findMany({ where: { type: 'REMINDER' } })) as FullDBTimeout<'REMINDER'>[]
    )
      .filter((reminder) => reminder.data.userId === this.user.id)
      .sort((a, b) => a.expiration.getTime() - b.expiration.getTime());

    cache.set(`reminders:${this.user.id}`, userReminders, 60 * 1000 * 15);

    await this.reply({
      ...(await renderList.call(this, userReminders)),
      ephemeral: true,
    });
  },
});

export const ReminderSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const index = parseInt(this.values[0]);
    const userReminders = cache.get<FullDBTimeout<'REMINDER'>[]>(`reminders:${this.user.id}`);

    await this.update(await renderReminder.call(this, userReminders, index));
  },
});

export const EditButton = ButtonComponent({
  async handle(index: number) {
    const { data, expiration } = cache.get<FullDBTimeout<'REMINDER'>[]>(
      `reminders:${this.user.id}`
    )[index];

    const modal = new EditModal(index)
      .setTitle('Edit Reminder')
      .setComponents(
        row(
          new TextInputComponent()
            .setLabel('Subject')
            .setValue(data.subject)
            .setCustomId('subject')
            .setMaxLength(100)
            .setStyle('PARAGRAPH')
            .setRequired(true)
        ),
        row(
          new TextInputComponent()
            .setLabel('When to send')
            .setValue(dayjs(expiration).format('YYYY-MM-DD HH:mm'))
            .setCustomId('date')
            .setMaxLength(16)
            .setMinLength(16)
            .setStyle('SHORT')
            .setRequired(true)
        )
      );

    await this.showModal(modal);
  },
});

export const EditModal = ModalComponent({
  async handle(index: number) {
    const reminderList = cache.get<FullDBTimeout<'REMINDER'>[]>(`reminders:${this.user.id}`);
    const reminder = reminderList[index];
    const subject = this.fields.getTextInputValue('subject');

    try {
      resolveToDate(this.fields.getTextInputValue('date'));
    } catch (e) {
      return this.reply(CRBTError('Invalid date format'));
    }

    const expiration = (await resolveToDate(this.fields.getTextInputValue('date'))).toDate();

    const newTimeout = (await db.timeouts.update({
      where: { id: reminder.id },
      data: { data: { ...reminder.data, subject }, expiration },
    })) as FullDBTimeout<'REMINDER'>;

    reminderList.splice(index, 1, newTimeout);

    cache.set(`reminders:${this.user.id}`, reminderList, 60 * 1000 * 15);

    await this.update(await renderReminder.call(this, reminderList, index));
  },
});

export const BackButton = ButtonComponent({
  async handle() {
    const userReminders = cache.get<FullDBTimeout<'REMINDER'>[]>(`reminders:${this.user.id}`);

    return await this.update(await renderList.call(this, userReminders));
  },
});

export const DeleteButton = ButtonComponent({
  async handle(index: number) {
    const embed = this.message.embeds[0];
    await this.update({
      embeds: [
        new MessageEmbed({ ...embed }).setAuthor({
          name: 'Are you sure you want to delete this reminder?',
        }),
      ],
      components: components(
        row(
          new ConfirmDeleteButton(index).setLabel('Yes').setStyle('DANGER'),
          new BackButton().setLabel('Cancel').setStyle('SECONDARY')
        )
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle(index: number) {
    const userReminders = cache.get<FullDBTimeout<'REMINDER'>[]>(`reminders:${this.user.id}`);
    const reminder = userReminders[index];

    await db.timeouts.delete({ where: { id: reminder.id } });

    userReminders.splice(index, 1);

    cache.set(`reminders:${this.user.id}`, userReminders, 60 * 1000 * 15);

    return await this.update(await renderList.call(this, userReminders));
  },
});

async function renderReminder(
  this: SelectMenuInteraction | ModalSubmitInteraction,
  userReminders: FullDBTimeout<'REMINDER'>[],
  index: number
) {
  const { data, expiration } = userReminders[index];
  const [guildId, channelId, messageId] = data.url.split('/');
  const { JUMP_TO_MSG, BACK, EDIT, DELETE } = t(this, 'genericButtons');
  const { strings } = t(this, 'remind me');
  const channel = this.client.channels.cache.get(channelId) as TextChannel;
  const url = `https://discordapp.com/channels/${data.url}`;

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${this.user.tag} - Reminders (${userReminders.length})`,
          iconURL: avatar(this.user, 64),
        })
        .setTitle(data.subject)
        .setDescription(
          `Will be sent <t:${dayjs(expiration).unix()}:R> in ${
            data.destination === 'dm' ? 'your DMs' : `${channel}`
          }\nCreated <t:${snowStamp(messageId).unix()}> (<t:${snowStamp(messageId).unix()}:R>)`
        )
        .setColor(this.message.embeds[0].color),
    ],
    components: components(
      row(
        new ReminderSelectMenu()
          .setPlaceholder('Select a reminder to edit or delete.')
          .setMaxValues(1)
          .addOptions(
            userReminders.map(({ data, expiration }, index) => ({
              label: data.subject,
              description: `${dayjs(expiration).fromNow()}`,
              value: index.toString(),
            }))
          )
      ),
      row(
        new BackButton().setLabel(BACK).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        new EditButton(index).setLabel(EDIT).setEmoji(emojis.buttons.pencil).setStyle('PRIMARY'),
        new DeleteButton(index)
          .setLabel(DELETE)
          .setEmoji(emojis.buttons.trash_bin)
          .setStyle('DANGER')
      ),
      row(
        new MessageButton().setStyle('LINK').setURL(url).setLabel(JUMP_TO_MSG),
        new MessageButton()
          .setStyle('LINK')
          .setLabel(strings.BUTTON_GCALENDAR)
          .setURL(
            `https://calendar.google.com/calendar/render?${new URLSearchParams({
              action: 'TEMPLATE',
              text: data.subject,
              dates: `${dayjs(expiration).format('YYYYMMDD')}/${dayjs(expiration)
                .add(1, 'day')
                .format('YYYYMMDD')}`,
              details: `${strings.GCALENDAR_EVENT} ${
                data.destination
                  ? strings.GCALENDAR_EVENT_CHANNEL.replace(
                      '<CHANNEL>',
                      `#${channel.name}`
                    ).replace('<SERVER>', channel.guild.name)
                  : strings.GCALENDAR_EVENT_DM
              }`,
              location: url,
            })}`
          )
      )
    ),
  };
}

async function renderList(
  this: CommandInteraction | ButtonInteraction,
  userReminders: FullDBTimeout<'REMINDER'>[]
) {
  const reminderCmd = allCommands.find(({ name }) => name === 'reminder');

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${this.user.tag} - Reminders (${userReminders.length})`,
          iconURL: avatar(this.user, 64),
        })
        .setDescription(
          userReminders.length === 0
            ? `Uh oh, you don't have any reminders set. Use </reminder new:${reminderCmd.id}> to set one!`
            : `You can create a new reminder with </reminder new:${reminderCmd.id}>!`
        )
        .setFields(
          userReminders
            .sort((a, b) => a.expiration.getTime() - b.expiration.getTime())
            .map(({ data, expiration }) => ({
              name: `${data.subject}`,
              value: `<t:${dayjs(expiration).unix()}:R>\nDestination: ${
                data.destination === 'dm' ? 'In your DMs' : `<#${data.destination}>`
              }`,
            }))
        )
        .setColor(
          this instanceof ButtonInteraction
            ? this.message.embeds[0].color
            : await getColor(this.user)
        ),
    ],
    components:
      userReminders.length === 0
        ? []
        : components(
            row(
              new ReminderSelectMenu()
                .setPlaceholder('Select a reminder to edit or delete.')
                .setMaxValues(1)
                .addOptions(
                  userReminders.map(({ data, expiration }, index) => ({
                    label: data.subject,
                    description: `${dayjs(expiration).fromNow()}`,
                    value: index.toString(),
                  }))
                )
            )
          ),
  };
}

// export const DeleteReminderButton = ButtonComponent({ handle() {} });
