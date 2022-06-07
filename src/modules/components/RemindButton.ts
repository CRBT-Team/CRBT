import { emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import dayjs from 'dayjs';
import { Message, MessageButton, MessageMentions } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';

export const RemindButton = ButtonComponent({
  async handle({
    relativetime,
    userId,
    locale,
  }: {
    relativetime: number;
    userId: string;
    locale: string;
  }) {
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
    if (this.channel.type !== 'DM' && (this.message.mentions as MessageMentions).has(this.user)) {
      return this.reply(CRBTError('You cannot snooze a reminder you did not set.'));
    }
    const url = (this.message.components[0].components[0] as MessageButton).url.replace(
      'https://discord.com/channels/',
      ''
    );
    await setDbTimeout({
      type: 'REMINDER',
      expiration: dayjs().add(15, 'minutes').toDate(),
      data: {
        destination: url.startsWith('@me') ? 'dm' : url.split('/')[1],
        userId: this.user.id,
        subject: this.message.embeds[0].fields[0].value,
        url: ((await this.fetchReply()) as Message).url.replace(
          'https://discord.com/channels/',
          ''
        ),
      },
      locale: this.locale,
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
