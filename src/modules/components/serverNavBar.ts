import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { ButtonComponent, row } from 'purplet';
import { renderServerIcon } from '../info/server icon';
import { renderServerInfo, renderServerMembersRoles } from '../info/server info';
import { NavBarContext } from './userNavBar';

type Tabs = 'server_info' | 'icon' | 'roles' | 'extra';

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

export function serverNavBar(ctx: NavBarContext, locale: string, activeTab: Tabs) {
  const { strings } = t(locale, 'server_navbar');

  return row(
    new ServerInfoBtn(ctx)
      .setLabel(strings.INFO)
      .setStyle('SECONDARY')
      .setDisabled(activeTab === 'server_info'),
    new ServerIconBtn(ctx)
      .setLabel(strings.ICON)
      .setStyle('SECONDARY')
      .setDisabled(activeTab === 'icon'),
    new ServerMembersBtn(ctx)
      .setLabel(strings.ROLES)
      .setStyle('SECONDARY')
      .setDisabled(activeTab === 'roles')
  );
}
