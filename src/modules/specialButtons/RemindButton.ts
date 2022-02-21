import { colors, emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { setReminder } from '$lib/functions/setReminder';
import dayjs from 'dayjs';
import { Message, MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';

export const RemindButton = ButtonComponent({
  async handle({ relativetime, userId }: { relativetime: number; userId: string }) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only set reminders for commands you ran yourself.'));
    }

    await setReminder({
      reminder: 'Command reminder from CRBT.',
      expiration: dayjs(relativetime).toISOString(),
      user_id: this.user.id,
      destination: 'dm',
      url: (this.message as Message).url.replace('https://discord.com/channels/', ''),
    }).then(async () => {
      await this.update({
        components: [],
      });
      await this.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.success} Reminder set!`)
            .setDescription(
              `You will be reminded by DM to use this command in <t:${dayjs(
                relativetime
              ).unix()}:R>...`
            )
            .setColor(`#${colors.success}`),
        ],
        ephemeral: true,
      });
    });
  },
});
