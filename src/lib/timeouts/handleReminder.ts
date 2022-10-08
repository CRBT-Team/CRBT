import { emojis, icons } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { time } from '$lib/functions/time';
import { t } from '$lib/language';
import { Reminder } from '@prisma/client';
import { Client, GuildTextBasedChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, row } from 'purplet';
import { SnoozeButton } from '../../modules/components/RemindButton';
import { getReminderSubject } from '../../modules/tools/reminder list';

export async function handleReminder(reminder: Reminder, client: Client) {
  const { JUMP_TO_MSG } = t(reminder.locale, 'genericButtons');
  const { strings } = t(reminder.locale, 'remind me');
  const [guildId, channelId, messageId] = reminder.id.split('/');

  const user = await client.users.fetch(reminder.userId);
  const dest =
    reminder.destination === 'dm'
      ? user
      : (await client.channels.fetch(channelId) as GuildTextBasedChannel);

  const message = {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: strings.REMINDER_TITLE,
          iconURL: icons.reminder,
        })
        .setDescription(
          strings.REMINDER_DESCRIPTION.replace('<TIME>', time(reminder.expiresAt, 'D')).replace(
            '<RELATIVE_TIME>',
            time(reminder.expiresAt, 'R')
          )
        )
        .addField(strings.SUBJECT, getReminderSubject(reminder, client, 0))
        .setColor(await getColor(user)),
    ],
    components: components(
      row(
        new MessageButton()
          .setStyle('LINK')
          .setLabel(JUMP_TO_MSG)
          .setURL(`https://discord.com/channels/${reminder.id}`),
        new SnoozeButton()
          .setStyle('SECONDARY')
          .setEmoji(emojis.reminder)
          .setLabel(strings.BUTTON_SNOOZE)
      )
    ),
  };

  try {
    await dest.send({
      allowedMentions: {
        users: [user.id],
      },
      content: reminder.destination !== 'dm' ? user.toString() : null,
      ...message,
    });
  } catch (e) {
    const dest = (await client.channels.fetch(channelId) as GuildTextBasedChannel);

    await dest.send({
      allowedMentions: {
        users: [user.id],
      },
      content: user.toString(),
      ...message,
    });
  }
}
