import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis, links } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { User } from '@prisma/client';
import { ButtonInteraction, CommandInteraction } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';
import { ConfirmDataDeletion, ExportAllData } from './manage-data';

const privacyPreferences = [
  ['telemetry', 'TELEMETRY'],
  ['silentJoins', 'SILENT_JOINS'],
  ['silentLeaves', 'SILENT_LEAVES'],
];

export default ChatCommand({
  name: 'privacy',
  description: t('en-US', 'privacy.description'),
  nameLocalizations: getAllLanguages('privacy.name', localeLower),
  descriptionLocalizations: getAllLanguages('privacy.description'),
  async handle() {
    const preferences = (await prisma.user.findFirst({
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
  const accentColor = await getColor(this.user);

  return {
    embeds: [
      {
        author: {
          name: `CRBT - ${t(this, 'PRIVACY_SETTINGS_TITLE')}`,
          icon_url: icon(accentColor, 'settings', 'image'),
        },
        description: `You can review our **[Privacy Policy on the website](${links.policy})**.`,
        fields: [
          ...privacyPreferences.map(([id, stringId]) => ({
            name: t(this, stringId as any),
            value: t(this, `PRIVACY_${stringId}_DESCRIPTION` as any),
          })),
          {
            name: t(this, 'YOUR_CRBT_DATA'),
            value: t(this, 'PRIVACY_CRBT_DATA_DESCRIPTION'),
          },
        ],
        color: accentColor,
      },
    ],
    components: components(
      row(
        ...privacyPreferences.map(([id, stringId]) =>
          new ToggleSettingBtn({ setting: id, newState: !preferences[id] })
            .setLabel(t(this, stringId as any))
            .setStyle('SECONDARY')
            .setEmoji(preferences[id] ? icon(accentColor, 'toggleon') : emojis.toggle.off)
        )
      ),
      row(
        new ExportAllData().setStyle('PRIMARY').setLabel('Download my data'),
        new ConfirmDataDeletion().setStyle('DANGER').setLabel('Delete my data')
      )
    ),
  };
}
