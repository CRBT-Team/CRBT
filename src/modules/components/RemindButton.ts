import { emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import { MessageButton } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';

export const RemindButton = ButtonComponent({
  async handle({ relativetime, userId }) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only set reminders for commands you ran yourself.'));
    }
    if (relativetime < new Date().getTime()) {
      return this.reply(
        CRBTError("You can't set this reminder as the cooldown for this command has passed.")
      );
    }

    // TODO: redo with the timeouts system

    // const reminder = await db.reminders.findFirst({
    //   where: {
    //     userId: userId,
    //     destination: 'dm',
    //     reminder: 'Command reminder from CRBT.',
    //   },
    //   orderBy: { expiration: 'desc' },
    // });

    // if (!reminder || Math.abs(reminder.expiration.getTime() - relativetime) > 60000) {
    //   await setReminder({
    //     reminder: 'Command reminder from CRBT.',
    //     locale,
    //     expiration: dayjs(relativetime).toDate(),
    //     userId: this.user.id,
    //     destination: 'dm',
    //     url:
    //       this.message instanceof Message
    //         ? this.message.url.replace('https://discord.com/channels/', '')
    //         : `@me/${this.user.dmChannel}/${this.message.id}`,
    //     id: 0n,
    //   });
    // }
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
    if (!this.guild && this.message.mentions.toString().includes(this.user.id)) {
      return this.reply(CRBTError('You cannot snooze a reminder you did not set.'));
    }

    const { JUMP_TO_MSG } = t(this, 'genericButtons');
    const button = this.message.components[0].components[0];
    const url = (button as MessageButton).url.replace('https://discord.com/channels/', '');

    await setDbTimeout({
      id: url,
      type: 'REMINDER',
      expiration: dayjs().add(15, 'minutes').toDate(),
      data: {
        destination: url.startsWith('@me') ? 'dm' : url.split('/')[1],
        userId: this.user.id,
        subject: this.message.embeds[0].fields[0].value,
        url,
      },
      locale: this.locale,
    });

    this.update({
      components: components(
        row(
          new MessageButton()
            .setStyle('LINK')
            .setLabel(JUMP_TO_MSG)
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
