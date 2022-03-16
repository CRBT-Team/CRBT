import { db, emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { setReminder } from '$lib/functions/setReminder';
import dayjs from 'dayjs';
import { Message, MessageButton, MessageMentions } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';

export const RemindButton = ButtonComponent({
  async handle({ relativetime, userId }: { relativetime: number; userId: string }) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only set reminders for commands you ran yourself.'));
    }
    if (relativetime < new Date().getTime()) {
      return this.reply(
        CRBTError("You can't set this reminder as the cooldown for this command has passed.")
      );
    }

    const reminder = await db.reminders.findFirst({
      where: {
        user_id: userId,
        destination: 'dm',
        reminder: 'Command reminder from CRBT.',
      },
      orderBy: { expiration: 'desc' },
    });

    if (!reminder || Math.abs(reminder.expiration.getTime() - relativetime) > 60000) {
      await setReminder({
        reminder: 'Command reminder from CRBT.',
        expiration: dayjs(relativetime).toISOString(),
        user_id: this.user.id,
        destination: 'dm',
        url:
          this.message instanceof Message
            ? this.message.url.replace('https://discord.com/channels/', '')
            : `@me/${this.user.dmChannel}/${this.message.id}`,
      });
    }
    await this.update({
      components: components(
        row(
          new MessageButton()
            .setCustomId('none')
            .setStyle('SECONDARY')
            .setLabel('Reminder set!')
            .setEmoji(emojis.success)
            .setDisabled(true)
        )
      ),
    });
  },
});

export const SnoozeButton = ButtonComponent({
  async handle() {
    if (this.channel.type !== 'DM' && (this.message.mentions as MessageMentions).has(this.user)) {
      return this.reply(CRBTError('You cannot snooze a reminder you did not set.'));
    }
    const url = (this.message.components[0].components[0] as MessageButton).url.replace(
      'https://discord.com/channels/',
      ''
    );
    await setReminder({
      reminder: this.message.embeds[0].fields[0].value,
      user_id: this.user.id,
      expiration: dayjs().add(15, 'minutes').toDate(),
      destination: url.startsWith('@me') ? 'dm' : url.split('/')[1],
      url,
    });

    this.update({
      components: components(
        row(
          new MessageButton()
            .setStyle('LINK')
            .setLabel('Jump to message')
            .setURL(`https://discord.com/channels/${url}`),
          new MessageButton()
            .setStyle('SECONDARY')
            .setEmoji(emojis.success)
            .setCustomId('none')
            .setLabel('Snoozed for 15 minutes')
            .setDisabled(true)
        )
      ),
    });
  },
});
// https://discord.com/channels/403966971147845636/532551630562787328/952271389786771477
// https://discord.com/channels/@me/639241740800491566/952657528771211315
