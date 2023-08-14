import { emojis, icons } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { getAllLanguages, t } from '$lib/language';
import { EditableUserSettings } from '$lib/types/user-settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { EmbedFieldData, Interaction, MessageSelectOptionData } from 'discord.js';
import { ButtonComponent, ChatCommand, SelectMenuComponent, components, row } from 'purplet';
import { UserSettingsMenus, getUser, resolveUserSettingsProps } from './_helpers';

export default ChatCommand({
  name: 'user settings',
  description: t('en-US', 'user settings.description'),
  descriptionLocalizations: getAllLanguages('user settings.description'),
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    renderUserSettingsMenu.call(this).then((r) => this.editReply(r));
  },
});

export async function renderUserSettingsMenu(this: Interaction) {
  const user = await getUser(this.user.id, true);
  const embedFields: EmbedFieldData[] = [];
  const selectMenuOptions: MessageSelectOptionData[] = [];
  const accentColor = await getColor(this.user);

  UserSettingsMenus.forEach((menu, menuId) => {
    if (menu.isSubMenu) return;

    const props = resolveUserSettingsProps(this, menu, user, accentColor);

    let icon = props.errors.length ? '⚠️' : emojis.features?.[menuId] ?? '';
    let description = props.errors.length
      ? t(this, 'ATTENTION_REQUIRED')
      : menu.description(this.locale);

    embedFields.push({
      name: `${icon} ${t(this, menuId)}`,
      value: description,
    });

    selectMenuOptions.push({
      label: `${t(this, menuId)} ${menu.newLabel ? `[✨ ${t(this, 'NEW')}]` : ''}`,
      value: menuId,
      emoji: icon,
      description: props.errors.length ? t(this, 'ATTENTION_REQUIRED') : '',
    });
  });

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: `${formatUsername(this.user)} - ${t(this, 'USER_SETTINGS_TITLE')}`,
          iconURL: icons.settings,
        },
        title: t(this, 'OVERVIEW'),
        description: t(this, 'USER_SETTINGS_DESCRIPTION'),
        fields: embedFields,
        thumbnail: { url: avatar(this.user) },
        color: await getColor(this.user),
      },
    ],
    components: components(
      row(
        new FeatureSelectMenu().setPlaceholder(t(this, 'FEATURES')).setOptions(selectMenuOptions),
      ),
    ),
    ephemeral: true,
  };
}

export const FeatureSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    await this.deferUpdate();

    const featureId = this.values[0] as EditableUserSettings;

    userFeatureSettings.call(this, featureId).then((r) => this.editReply(r));
  },
});

export async function userFeatureSettings(
  this: Interaction,
  menuId: EditableUserSettings,
): Promise<any> {
  const menu = UserSettingsMenus.get(menuId);
  const user = await getUser(this.user.id);
  const color = await getColor(this.user);
  const props = resolveUserSettingsProps(this, menu, user, color);
  const backBtn = new BackSettingsButton(null)
    // .setLabel(t(this, 'SETTINGS'))
    .setEmoji(emojis.buttons.left_arrow)
    .setStyle('SECONDARY');
  const message = menu.renderMenuMessage({ ...props, backBtn });

  return {
    content: invisibleChar,
    components: message.components,
    embeds: [
      {
        author: {
          name: `${formatUsername(this.user)} - ${t(this, 'USER_SETTINGS_TITLE')}`,
          icon_url: icons.settings,
        },
        title: `${t(this, menuId)} ${menu.newLabel ? `[${t(this, 'NEW')}]` : ''}`,
        description: menu.description(this.locale),
        color,
        ...message.embeds[0],
      },
      ...message.embeds.slice(1),
    ],
  };
}

export const BackSettingsButton = ButtonComponent({
  async handle(feature: string | null) {
    await this.deferUpdate();

    if (feature) {
      userFeatureSettings
        .call(this, feature as EditableUserSettings)
        .then((r) => this.editReply(r));
    }
    return renderUserSettingsMenu.call(this).then((r) => this.editReply(r));
  },
});
