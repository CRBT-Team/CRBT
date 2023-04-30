import emojis, { icon } from '$lib/env/emojis';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { UserSettingsMenus } from '$lib/types/user-settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { Interaction } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row, SelectMenuComponent } from 'purplet';
import { getUser, resolveUserSettingsProps, userSettingsMenus } from './_helpers';

export default ChatCommand({
  name: 'user settings',
  description: "Customize CRBT's User Settings.",
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    await this.editReply(await renderUserSettingsMenu.call(this));
  },
});

export async function renderUserSettingsMenu(this: Interaction) {
  const user = await getUser(this.guild.id);
  const accentColor = await getColor(this.user);
  const userSettingsProps = await Promise.all(
    Object.values(UserSettingsMenus).map((m) => resolveUserSettingsProps(this, m, user))
  );

  const options = Object.values(UserSettingsMenus)
    .map((menu) => {
      const props = userSettingsProps.find((v) => v.menu === menu);
      const featureSettings = userSettingsMenus[menu];

      return {
        label:
          t(this, menu) +
          (featureSettings.newLabel ? ` [${t(this, 'NEW').toLocaleUpperCase(this.locale)}]` : ''),
        value: menu,
        ...(props.errors.length > 0
          ? {
              emoji: '⚠️',
              description: t(this, 'ATTENTION_REQUIRED'),
            }
          : featureSettings.getSelectMenu(props)),
      };
    })
    .filter(Boolean);

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: `CRBT - ${t(this, 'SETTINGS_TITLE')}`,
          iconURL: icon(accentColor, 'settings', 'image'),
        },
        title: `${this.guild.name} / ${t(this, 'OVERVIEW')}`,
        description: t(this, 'SETTINGS_DESCRIPTION'),
        fields: Object.values(UserSettingsMenus).map((menu) => {
          const props = userSettingsProps.find((v) => v.menu === menu);
          const menuSettings = userSettingsMenus[menu];
          let { icon: i, value } = menuSettings.getOverviewValue(props);
          if (props.errors.length) {
            (i = '⚠️'), (value = t(this, 'ATTENTION_REQUIRED'));
          }

          return {
            name: `${i} **${t(this, menu)}**`,
            value: value ?? `*${t(this, 'NONE')}*`,
            inline: true,
          };
        }),
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(new FeatureSelectMenu().setPlaceholder(t(this, 'FEATURES')).setOptions(options))
    ),
    ephemeral: true,
  };
}

export const FeatureSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const featureId = this.values[0] as UserSettingsMenus;

    this.update(await renderFeatureSettings.call(this, featureId));
  },
});

export async function renderFeatureSettings(
  this: Interaction,
  menu: UserSettingsMenus
): Promise<any> {
  const { getComponents, getMenuDescription, newLabel } = userSettingsMenus[menu];
  const user = await getUser(this.guild.id);
  const accentColor = await getColor(this.user);
  const props = await resolveUserSettingsProps(this, menu, user);
  const { errors } = props;

  const backBtn = new BackSettingsButton(null)
    // .setLabel(t(this, 'SETTINGS'))
    .setEmoji(emojis.buttons.left_arrow)
    .setStyle('SECONDARY');

  const embed = getMenuDescription(props);

  return {
    content: invisibleChar,
    embeds: [
      {
        // ...getGuildSettingsHeader(this.locale, accentColor, [
        //   this.guild.name,
        //   `${t(this, menu)} ${
        //     newLabel ? `[${t(this, 'NEW').toLocaleUpperCase(this.locale)}]` : ''
        //   }`,
        // ]),
        color: await getColor(this.guild),
        ...embed,
        fields:
          errors.length > 0
            ? [
                {
                  name: `${t(this, 'STATUS')} • ${t(this, 'SETTINGS_ERRORS_FOUND', {
                    number: errors.length.toLocaleString(this.locale),
                  })}`,
                  value: errors.map((error) => `⚠️ **${error}**`).join('\n'),
                },
              ]
            : embed?.fields,
      },
    ],
    components: getComponents({
      ...props,
      backBtn,
    }),
  };
}

export const BackSettingsButton = ButtonComponent({
  async handle(feature: string | null) {
    if (feature) {
      return this.update(await renderFeatureSettings.call(this, feature as UserSettingsMenus));
    }
    return this.update(await renderUserSettingsMenu.call(this));
  },
});
