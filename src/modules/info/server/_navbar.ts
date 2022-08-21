import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { Guild } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { NavBarContext } from '../user/_navbar';
import { renderServerIcon } from './server_icon';
import { renderServerEmojis, renderServerInfo, renderServerMembersRoles } from './server_info';

type DefaultTabs = 'server_info' | 'roles' | 'extra';
type Tabs = 'server_info' | 'icon' | 'roles' | 'emojis' | 'extra';

export const ServerInfoBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.userId) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const guild = this.client.guilds.cache.get(opts.targetId);

    this.update(await renderServerInfo.call(this, guild, opts));
  },
});

export const ServerIconBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.userId) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const guild = this.client.guilds.cache.get(opts.targetId);

    this.update(await renderServerIcon.call(this, guild, opts));
  },
});

export const ServerMembersBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.userId) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const guild = this.client.guilds.cache.get(opts.targetId);

    this.update(await renderServerMembersRoles.call(this, guild, opts));
  },
});

export const ServerEmojisBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.userId) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const guild = this.client.guilds.cache.get(opts.targetId);

    this.update(await renderServerEmojis.call(this, guild, opts));
  },
});

export function getTabs(activeTab: Tabs, guild: Guild) {
  const tabs = new Set<Tabs>();
  tabs.add(activeTab);

  if (guild.icon) {
    tabs.add('icon');
  }

  if (guild.emojis.cache.size > 0) {
    tabs.add('emojis');
  }

  return tabs;
}

export function serverNavBar(
  ctx: NavBarContext,
  locale: string,
  activeTab: Tabs,
  addTabs?: Set<Omit<Tabs, DefaultTabs>>
) {
  const { strings } = t(locale, 'server_navbar');

  return row(
    new ServerInfoBtn(ctx)
      .setLabel(strings.INFO)
      .setStyle('SECONDARY')
      .setDisabled(activeTab === 'server_info'),
    addTabs?.has('icon')
      ? new ServerIconBtn(ctx)
          .setLabel(strings.ICON)
          .setStyle('SECONDARY')
          .setDisabled(activeTab === 'icon')
      : null,
    new ServerMembersBtn(ctx)
      .setLabel(strings.ROLES)
      .setStyle('SECONDARY')
      .setDisabled(activeTab === 'roles'),
    addTabs?.has('emojis')
      ? new ServerEmojisBtn(ctx)
          .setLabel(strings.EMOJIS)
          .setStyle('SECONDARY')
          .setDisabled(activeTab === 'emojis')
      : null
  );
}
