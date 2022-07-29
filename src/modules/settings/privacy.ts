import { cache } from '$lib/cache';
import { db, emojis, icons, links } from '$lib/db';
import { getColor } from '$lib/functions/getColor';
import { AchievementProgress } from '$lib/responses/Achievements';
import { users } from '@prisma/client';
import { ButtonInteraction, CommandInteraction, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'privacy',
  description: 'Review your CRBT privacy settings and edit them.',
  async handle() {
    const preferences = (await db.users.findFirst({
      where: { id: this.user.id },
      select: { telemetry: true, silentJoins: true, silentLeaves: true },
    })) || {
      telemetry: true,
      silentJoins: false,
      silentLeaves: false,
    };

    await this.reply({
      ...(await renderPrivacySettings.call(this, preferences)),
      ephemeral: true,
    });

    await AchievementProgress.call(this, 'SAFETY_FIRST');
  },
});

export const ToggleSettingBtn = ButtonComponent({
  async handle({ setting, newState }: { setting: keyof users; newState: boolean }) {
    const newData = await db.users.upsert({
      where: { id: this.user.id },
      create: { [setting]: newState, id: this.user.id },
      update: { [setting]: newState },
    });

    if (setting === 'telemetry') {
      cache.set(`tlm_${this.user.id}`, newState);
    }

    await this.update(await renderPrivacySettings.call(this, newData));
  },
});

async function renderPrivacySettings(
  this: CommandInteraction | ButtonInteraction,
  { telemetry, silentJoins, silentLeaves }: Partial<users>
) {
  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: 'CRBT - Privacy Settings', iconURL: icons.settings })
        .setDescription(`You can review our **[Privacy Policy on the website](${links.policy})**.`)
        .addField(
          `Telemetry`,
          `Telemetry logs command usage info detailed in CRBT's Privacy Policy. Turning it off will not erase previous logs but only stops them from being sent. Unknown error messages are unaffected by this setting.`
        )
        .addField(
          `Welcome message announcements`,
          `Turning the setting off will disable CRBT's Welcome messages from being sent when you join any server.`
        )
        .addField(
          `Farewell message announcements`,
          `Turning the setting off will disable CRBT's Farewell messages from being sent when you leave any server.`
        )
        .setColor(await getColor(this.user)),
    ],
    components: components(
      row(
        new ToggleSettingBtn({ setting: 'telemetry', newState: !telemetry })
          .setLabel(`Telemetry`)
          .setStyle('SECONDARY')
          .setEmoji(emojis.toggle[telemetry ? 'on' : 'off']),
        new ToggleSettingBtn({ setting: 'silentJoins', newState: !silentJoins })
          .setLabel(`Welcome message announcements`)
          .setStyle('SECONDARY')
          .setEmoji(emojis.toggle[silentJoins ? 'off' : 'on']),
        new ToggleSettingBtn({ setting: 'silentLeaves', newState: !silentLeaves })
          .setLabel(`Farewell message announcements`)
          .setStyle('SECONDARY')
          .setEmoji(emojis.toggle[silentLeaves ? 'off' : 'on'])
      )
    ),
  };
}
