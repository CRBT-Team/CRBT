import { colors, emojis } from '$lib/db';
import { setReminder } from '$lib/functions/setReminder';
import dayjs from 'dayjs';
import { Message, MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';

export const RemindButton = ButtonComponent({
  async handle(relativetime: number) {
    await setReminder({
      reminder: 'Command reminder from CRBT.',
      expiration: dayjs(relativetime),
      user_id: this.user.id,
      destination: 'dm',
      url: (this.message as Message).url,
    }).then(async () => {
      await this.update({
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
        components: [],
      });
    });
  },
});
