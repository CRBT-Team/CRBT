import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { ReminderTypes } from '@prisma/client';
import { MessageButton } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getUserReminders } from '../tools/reminders/_helpers';

export const RemindButton = ButtonComponent({
  async handle({ relativetime, userId }) {
    if (this.user.id !== userId) {
      return CRBTError(this, 'You can only set reminders for commands you ran yourself.');
    }
    if (relativetime < new Date().getTime()) {
      return CRBTError(
        this,
        "You can't set this reminder as the cooldown for this command has passed.",
      );
    }

    const reminder = await prisma.reminder.findFirst({
      where: {
        userId: userId,
        destination: 'dm',
        type: ReminderTypes.COMMAND,
      },
      orderBy: { endDate: 'desc' },
    });

    const command =
      this.message.interaction.type === 'APPLICATION_COMMAND' &&
      this.message.interaction.commandName;

    if (!reminder || Math.abs(reminder.endDate.getTime() - relativetime) > 60000) {
      await dbTimeout(TimeoutTypes.Reminder, {
        id: `${this.guildId ?? '@me'}/${this.channelId}/${this.message.id}`,
        endDate: new Date(relativetime),
        destination: 'dm',
        userId: this.user.id,
        subject: `Command reminder from CRBT: ${slashCmd(command)}`,
        locale: this.locale,
        type: ReminderTypes.COMMAND,
        details: null,
      });
      // Refresh cache
      await getUserReminders(this.user.id, true);
    }

    await this.update({
      components: components(
        row(
          new MessageButton()
            .setCustomId('null')
            .setStyle('SECONDARY')
            .setLabel('Reminder set!')
            .setEmoji(emojis.success)
            .setDisabled(true),
        ),
      ),
    });
  },
});

// export const SnoozeButton = ButtonComponent({
//   async handle() {
//     if (this.guild && !(this.message.mentions as MessageMentions).has(this.user.id)) {
//       return CRBTError(this, t(this, 'user_navbar').errors.NOT_CMD_USER);
//     }

//     const { strings } = t(this, 'remind me');
//     const { JUMP_TO_MSG } = t(this, 'genericButtons');
//     const button = this.message.components[0].components[0];
//     const url = (this.message as Message).url;

//     await dbTimeout({
//       id: (button as MessageButton).url.replace('https://discord.com/channels/', ''),
//       expiresAt: new Date(Date.now() + 60 * 1000 * 15),
//       destination: url.includes('@me') ? 'dm' : url.split('/')[1],
//       userId: this.user.id,
//       subject: this.message.embeds[0].fields[0].value,
//       locale: this.locale,
//     } as Reminder, TimeoutTypes.Reminder);

//     this.update({
//       components: components(
//         row(
//           new MessageButton()
//             .setStyle('LINK')
//             .setLabel(JUMP_TO_MSG)
//             .setURL(`https://discord.com/channels/${url}`),
//           new MessageButton()
//             .setStyle('SECONDARY')
//             .setEmoji(emojis.success)
//             .setCustomId('none')
//             .setLabel(strings.BUTTON_SNOOZE_SUCCESS)
//             .setDisabled(true)
//         )
//       ),
//     });
//   },
// });
