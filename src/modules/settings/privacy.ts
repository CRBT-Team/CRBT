import { cache } from '$lib/cache';
import { db, emojis, illustrations, links } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { row } from '$lib/functions/row';
import { MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components } from 'purplet';

export default ChatCommand({
  name: 'privacy',
  description: 'Review your CRBT privacy settings and edit them.',
  async handle() {
    const enabled =
      cache.get(`tlm_${this.user.id}`) ??
      (
        await db.misc.findFirst({
          where: { id: this.user.id },
          select: { telemetry: true },
        })
      )?.telemetry ??
      true;

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'CRBT Settings - Privacy', iconURL: illustrations.settings })
          .setDescription(
            `You can review our **[Privacy Policy on the website](${links.privacypolicy})**.\n` +
              `${emojis.toggle[enabled ? 'on' : 'off']} Telemetry for all commands is currently ${
                enabled ? 'enabled, but' : 'disabled, and'
              } you can always turn it ${
                enabled ? 'off' : 'on'
              } with the button below.\nNote: Turning telemetry off won't delete any logs, it just stops them from being sent. Unknown error messages will still be sent regardless of this setting.`
          )
          .setColor(await getColor(this.user)),
      ],
      components: components(
        row(
          new ToggleTelemetryBtn({ enabled: !enabled, userId: this.user.id })
            .setLabel(`${enabled ? 'Disable' : 'Enable'} telemetry`)
            .setStyle(enabled ? 'DANGER' : 'SUCCESS')
        )
      ),
    });
  },
});

export const ToggleTelemetryBtn = ButtonComponent({
  async handle({ enabled, userId }: { enabled: boolean; userId: string }) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('Only the person who used this command can use this button.'));
    }

    await db.misc.upsert({
      where: { id: this.user.id },
      create: { telemetry: enabled, id: this.user.id },
      update: { telemetry: enabled },
    });
    cache.set(`tlm_${this.user.id}`, enabled);

    await this.update({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'CRBT Settings - Privacy', iconURL: illustrations.settings })
          .setDescription(
            `You can review our **[Privacy Policy on the website](${links.privacypolicy})**.\n` +
              `${emojis.toggle[enabled ? 'on' : 'off']} Telemetry for all commands is currently ${
                enabled ? 'enabled, but' : 'disabled, and'
              } you can always turn it ${
                enabled ? 'off' : 'on'
              } with the button below.\nNote: Turning telemetry off won't delete any logs, it just stops them from being sent. Unknown error messages will still be sent regardless of this setting.`
          )
          .setColor(await getColor(this.user)),
      ],
      components: components(
        row(
          new ToggleTelemetryBtn({ enabled: !enabled, userId: this.user.id })
            .setLabel(`${enabled ? 'Disable' : 'Enable'} telemetry`)
            .setStyle(enabled ? 'DANGER' : 'SUCCESS')
        )
      ),
    });
  },
});
