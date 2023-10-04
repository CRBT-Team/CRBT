import { prisma } from '$lib/db';
import { colors, emojis, icons, links } from '$lib/env';
import { t } from '$lib/language';
import { EditableUserSettings, UserSettingsMenusProps } from '$lib/types/user-settings';
import { MessageAttachment } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getUser } from './_helpers';
import { userFeatureSettings } from './settings';

const privacyPreferences = [
  ['hasTelemetryEnabled', 'TELEMETRY'],
  ['silentJoins', 'SILENT_JOINS'],
  ['silentLeaves', 'SILENT_LEAVES'],
];

export const privacySettings: UserSettingsMenusProps = {
  description: (l) =>
    `${t(l, 'PRIVACY_DESCRIPTION')} **[${t(l, 'PRIVACY_POLICY_LINK')}](${links.policy})**`,
  renderMenuMessage: ({ i, accentColor, user, backBtn }) => ({
    embeds: [
      {
        fields: [
          ...privacyPreferences.map(([id, stringId]) => ({
            name: t(i, stringId as any),
            value: t(i, `PRIVACY_${stringId}_DESCRIPTION` as any),
          })),
          {
            name: t(i, 'YOUR_CRBT_DATA'),
            value: t(i, 'PRIVACY_CRBT_DATA_DESCRIPTION'),
          },
        ],
        color: accentColor,
      },
    ],
    components: components(
      row(
        backBtn,
        ...privacyPreferences.map(([id, stringId]) =>
          new ToggleSettingBtn({ setting: id, newState: !user[id] })
            .setLabel(t(i, stringId as any))
            .setStyle('SECONDARY')
            .setEmoji(user[id] ? emojis.toggle.on : emojis.toggle.off),
        ),
      ),
      row(
        new ExportAllData().setStyle('PRIMARY').setLabel(t(i, 'PRIVACY_DOWNLOAD_MY_DATA')),
        new ConfirmDataDeletion().setStyle('DANGER').setLabel(t(i, 'PRIVACY_DELETE_MY_DATA')),
      ),
    ),
  }),
};

export const ToggleSettingBtn = ButtonComponent({
  async handle({ setting, newState }: { setting: string; newState: boolean }) {
    await prisma.user.upsert({
      where: { id: this.user.id },
      create: { [setting]: newState, id: this.user.id },
      update: { [setting]: newState },
    });

    await getUser(this.user.id, true);

    await this.update(await userFeatureSettings.call(this, EditableUserSettings.privacy));
  },
});

export const ExportAllData = ButtonComponent({
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    const userData = await prisma.user.findFirst({
      where: { id: this.user.id },
      include: { reminders: true, memberData: true },
    });

    await this.editReply({
      files: [
        new MessageAttachment(Buffer.from(JSON.stringify(userData, null, 2))).setName('data.json'),
      ],
    });
  },
});

export const ConfirmDataDeletion = ButtonComponent({
  async handle() {
    this.reply({
      embeds: [
        {
          author: {
            name: 'Are you sure that you want all of your data deleted forever?',
          },
          description:
            'This includes the **entirety** of your reminders, settings, badges and other data. All will be gone, **FOREVER**!',
          color: colors.red,
        },
      ],
      components: components(
        row(
          new DeleteAllData().setLabel('Yes, delete it all!').setStyle('DANGER'),
          new CancelButton().setLabel('Nevermind').setStyle('SECONDARY'),
        ),
      ),
      ephemeral: true,
    });
  },
});

export const CancelButton = ButtonComponent({
  async handle() {
    this.update({
      embeds: [
        {
          author: {
            name: 'Operation cancelled.',
            iconURL: icons.information,
          },
          color: colors.gray,
        },
      ],
      components: [],
    });
  },
});

export const DeleteAllData = ButtonComponent({
  async handle() {
    await prisma.user.delete({
      where: { id: this.user.id },
      include: {
        reminders: true,
        memberData: true,
      },
    });

    await this.update({
      embeds: [
        {
          title: `${emojis.success} All of your CRBT data has successfully been deleted.`,
          color: colors.success,
        },
      ],
      components: [],
    });
  },
});
