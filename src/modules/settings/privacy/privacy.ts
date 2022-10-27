import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis, icons, links } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { AchievementProgress } from '$lib/responses/Achievements';
import { User } from '@prisma/client';
import { ButtonInteraction, CommandInteraction } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';
import { ConfirmDataDeletion, ExportAllData } from './manage-data';

const privacyPreferences = [
  [
    'telemetry',
    'Anonymous Telemetry',
    'CRBT logs command usage as detailed in our Privacy Policy. Turning it off will not erase previous logs but stops them from being sent, and will not affect error messages.',
  ],
  [
    'silentJoins',
    'Silent joining',
    'Turning this setting on will stop CRBT from welcoming you when joining a server.',
  ],
  [
    'silentLeaves',
    'Silent leaving',
    'Turning this setting on will stop CRBT from announcing your departure when leaving a server.',
  ],
  [
    'enableAchievements',
    'Achievements',
    'CRBT tracks some of your usage in order to serve Achievements both globally and for each server. Server owners cannot access your individual data. Turning this off will freeze your achievements.',
  ],
];

export default ChatCommand({
  name: 'privacy',
  description: 'Review your CRBT privacy settings and edit them.',
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
        author: { name: 'CRBT - Privacy Settings', iconURL: icons.settings },
        description: `You can review our **[Privacy Policy on the website](${links.policy})**.`,
        fields: [
          ...privacyPreferences.map(([id, name, desc]) => ({
            name: name,
            value: desc,
          })),
          {
            name: 'Your CRBT data',
            value:
              'CRBT collects some data about you, whether you submit that data yourself or some we track to serve you some features. You can now ask to download all that data, or to delete it all. Warning, the latter will completely erase your reminders, polls, settings and you ever did on CRBT too.',
          },
        ],
        color: await getColor(this.user),
      },
    ],
    components: components(
      row(
        ...privacyPreferences.map(([id, name, desc]) =>
          new ToggleSettingBtn({ setting: id, newState: ![id] })
            .setLabel(name)
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
