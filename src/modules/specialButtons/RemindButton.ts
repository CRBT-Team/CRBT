import { colors, db, emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { setReminder } from '$lib/functions/setReminder';
import dayjs from 'dayjs';
import { Message, MessageButton, MessageEmbed } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';

export const RemindButton = ButtonComponent({
  async handle({ relativetime, userId }: { relativetime: number; userId: string }) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only set reminders for commands you ran yourself.'));
    }
    if (relativetime < new Date().getTime()) {
      return this.reply(
        CRBTError(
          "You can't set this reminder as the cooldown has already passed! You can use the command right now."
        )
      );
    }

    const reminder = await db.reminders.findFirst({
      where: {
        user_id: userId,
        destination: 'dm',
        reminder: 'Command reminder from CRBT.',
      },
      orderBy: {
        expiration: 'desc',
      },
    });

    if (reminder && Math.abs(reminder.expiration.getTime() - relativetime) < 60000) {
      await this.update({
        components: components(
          row(
            new MessageButton()
              .setCustomId('none')
              .setStyle('SECONDARY')
              .setLabel('Reminder Set')
              .setEmoji(emojis.success)
              .setDisabled(true)
          )
        ),
      });

      await this.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emojis.success} Reminder already set!`)
            .setDescription(
              `It seems like you already added a reminder for this command.\nYou will be reminded by DM to use this command in <t:${dayjs(
                relativetime
              ).unix()}:R>...`
            )
            .setColor(`#${colors.yellow}`),
        ],
        ephemeral: true,
      });
    } else {
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
      await this.update({
        components: components(
          row(
            new MessageButton()
              .setCustomId('none')
              .setStyle('SECONDARY')
              .setLabel('Reminder Set')
              .setEmoji(emojis.success)
              .setDisabled(true)
          )
        ),
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
    }
  },
});
