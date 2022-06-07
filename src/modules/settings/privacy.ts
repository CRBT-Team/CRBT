import { cache } from '$lib/cache';
import { db, emojis, icons, links } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'privacy',
  description: 'Review your CRBT privacy settings and edit them.',
  async handle() {
    let enabled: boolean;
    try {
      const fromCache = cache.get(this.user.id);
      if (fromCache === undefined) {
        const fromDB = (
          await db.users.findFirst({
            where: { id: this.user.id },
            select: { telemetry: true },
          })
        )?.telemetry;
        enabled = fromDB ?? true;
      }
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'CRBT Settings - Privacy', iconURL: icons.settings })
          .setDescription(
            `You can review our **[Privacy Policy on the website](${links.policy})**.\n` +
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

    await db.users.upsert({
      where: { id: this.user.id },
      create: { telemetry: enabled, id: this.user.id },
      update: { telemetry: enabled },
    });
    cache.set(`tlm_${this.user.id}`, enabled);

    await this.update({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'CRBT Settings - Privacy', iconURL: icons.settings })
          .setDescription(
            `You can review our **[Privacy Policy on the website](${links.policy})**.\n` +
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
