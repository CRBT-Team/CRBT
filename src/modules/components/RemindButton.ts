import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { Reminder } from '@prisma/client';
import { Message, MessageButton, MessageMentions } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';

export const RemindButton = ButtonComponent({
  async handle({ relativetime, userId }) {
    if (this.user.id !== userId) {
      return CRBTError(this, 'You can only set reminders for commands you ran yourself.');
    }
    if (relativetime < new Date().getTime()) {
      return CRBTError(this, "You can't set this reminder as the cooldown for this command has passed.");
    }

    // TODO: redo with the timeouts system

    // const reminder = await prisma.reminders.findFirst({
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
    if (this.guild && !(this.message.mentions as MessageMentions).has(this.user.id)) {
      return CRBTError(this, t(this, 'user_navbar').errors.NOT_CMD_USER);
    }

    const { strings } = t(this, 'remind me');
    const { JUMP_TO_MSG } = t(this, 'genericButtons');
    const button = this.message.components[0].components[0];
    const url = (this.message as Message).url;

    await dbTimeout({
      id: (button as MessageButton).url.replace('https://discord.com/channels/', ''),
      expiresAt: new Date(Date.now() + 60 * 1000 * 15),
      destination: url.includes('@me') ? 'dm' : url.split('/')[1],
      userId: this.user.id,
      subject: this.message.embeds[0].fields[0].value,
      locale: this.locale,
    } as Reminder, TimeoutTypes.Reminder);

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
            .setLabel(strings.BUTTON_SNOOZE_SUCCESS)
            .setDisabled(true)
        )
      ),
    });
  },
});
// https://discord.com/channels/403966971147845636/532551630562787328/952271389786771477
// https://discord.com/channels/@me/639241740800491566/952657528771211315
