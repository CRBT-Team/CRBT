import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis, icons, links } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { AchievementProgress } from '$lib/responses/Achievements';
import { User } from '@prisma/client';
import { ButtonInteraction, CommandInteraction } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';
import { ConfirmDataDeletion, ExportAllData } from './manage-data';

const privacyPreferences = [
  ['telemetry', 'TELEMETRY'],
  ['silentJoins', 'SILENT_JOINS'],
  ['silentLeaves', 'SILENT_LEAVES'],
  ['enableAchievements', 'ACHIEVEMENTS'],
];

export default ChatCommand({
  name: 'privacy',
  description: t('en-US', 'privacy.description'),
  nameLocalizations: getAllLanguages('privacy.name', localeLower),
  descriptionLocalizations: getAllLanguages('privacy.description'),
  async handle() {
    const preferences = (await prisma.user.findFirst({
      where: { id: this.user.id },
      select: { telemetry: true, silentJoins: true, silentLeaves: true, enableAchievements: true },
    })) || {
      telemetry: true,
      silentJoins: false,
      silentLeaves: false,
      enableAchievements: true,
    };

    await this.reply({
      ...(await renderPrivacySettings.call(this, preferences)),
      ephemeral: true,
    });

    await AchievementProgress.call(this, 'SAFETY_FIRST');
  },
});

export const ToggleSettingBtn = ButtonComponent({
  async handle({ setting, newState }: { setting: string; newState: boolean }) {
    const newData = await prisma.user.upsert({
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
  preferences: Partial<User>
) {
  return {
    embeds: [
      {
        author: {
          name: t(this, 'PRIVACY_SETTINGS_TITLE'),
          icon_url: icons.settings,
        },
        description: `You can review our **[Privacy Policy on the website](${links.policy})**.`,
        fields: [
          ...privacyPreferences.map(([id, langId]) => ({
            name: t(this, langId as any),
            value: t(this, `PRIVACY_${langId}_DESCRIPTION` as any),
          })),
          {
            name: t(this, 'YOUR_CRBT_DATA'),
            value: t(this, 'PRIVACY_CRBT_DATA_DESCRIPTION'),
          },
        ],
        color: await getColor(this.user),
      },
    ],
    components: components(
      row(
        ...privacyPreferences.map(([id, langId]) =>
          new ToggleSettingBtn({ setting: id, newState: !preferences[id] })
            .setLabel(t(this, `PRIVACY_${langId}_DESCRIPTION` as any))
            .setStyle('SECONDARY')
            .setEmoji(emojis.toggle[preferences[id] ? 'on' : 'off'])
        )
      ),
      row(
        new ExportAllData().setStyle('PRIMARY').setLabel('Download my data'),
        new ConfirmDataDeletion().setStyle('DANGER').setLabel('Delete my data')
      )
    ),
  };
}
