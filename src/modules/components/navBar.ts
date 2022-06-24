import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { GuildMember, User } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
// import { renderProfile } from '../../../disabled/profile';
import { renderPfp } from '../info/avatar';
import { renderBanner } from '../info/banner';
import { renderUser } from '../info/user info';

type DefaultTabs = 'avatar' | 'userinfo';
type Tabs = DefaultTabs | 'banner' | 'user_avatar' | 'user_banner';
export const AvatarSizes = {
  '1': 128,
  '2': 512,
  '3': 2048,
  '4': 4096,
};
export const AvatarFormats = {
  '1': 'png',
  '2': 'jpg',
  '3': 'webp',
  '4': 'gif',
};

export type NavBarContext = {
  userId: string;
  cmdUID: string;
  size?: keyof typeof AvatarSizes;
  format?: keyof typeof AvatarFormats;
};

export const UserInfoBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.cmdUID) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const u = await this.client.users.fetch(opts.userId);
    const m =
      this.guild && this.guild.members.cache.has(u.id) ? await this.guild.members.fetch(u) : null;

    this.update(await renderUser(this, u, opts, m));
  },
});

export const PfpBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.cmdUID) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const u = await this.client.users.fetch(opts.userId);
    const m =
      this.guild && this.guild.members.cache.has(u.id)
        ? await this.guild.members.fetch(u.id)
        : null;

    await this.update(await renderPfp('default', u, this, opts, m));
  },
});

export const UserPfpBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.cmdUID) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const u = await this.client.users.fetch(opts.userId);

    await this.update(await renderPfp('user', u, this, opts));
  },
});

export const UserBannerBtn = ButtonComponent({
  async handle(opts: NavBarContext) {
    const { errors } = t(this, 'user_navbar');

    if (this.user.id !== opts.cmdUID) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const u = await this.client.users.fetch(opts.userId);
    const m =
      this.guild && this.guild.members.cache.has(u.id) ? await this.guild.members.fetch(u) : null;

    //@ts-ignore
    await this.update(await renderBanner('user', u, this, opts, m));
  },
});

export function getTabs(activeTab: Tabs, user: User, member?: GuildMember) {
  const tabs = new Set<Tabs>();
  tabs.add(activeTab);

  if (member?.avatar) {
    tabs.add('user_avatar');
  }

  if (user.banner) {
    tabs.add('user_banner');
  }

  return tabs;
}

export function navBar(
  ctx: NavBarContext,
  locale: string,
  activeTab: Tabs,
  addTabs?: Set<Omit<Tabs, DefaultTabs>>
) {
  const { strings } = t(locale, 'user_navbar');

  return row(
    new UserInfoBtn(ctx)
      .setLabel(strings.INFO)
      .setStyle('SECONDARY')
      .setDisabled(activeTab === 'userinfo'),
    ...(addTabs?.has('user_avatar')
      ? [
          new PfpBtn(ctx)
            .setLabel(strings.SERVER_AVATAR)
            .setStyle('SECONDARY')
            .setDisabled(activeTab === 'avatar'),
          new UserPfpBtn(ctx)
            .setLabel(strings.USER_AVATAR)
            .setStyle('SECONDARY')
            .setDisabled(activeTab === 'user_avatar'),
        ]
      : [
          new PfpBtn(ctx)
            .setLabel(strings.AVATAR)
            .setStyle('SECONDARY')
            .setDisabled(activeTab === 'avatar'),
        ]),
    addTabs?.has('user_banner')
      ? new UserBannerBtn(ctx)
          .setLabel(strings.USER_BANNER)
          .setStyle('SECONDARY')
          .setDisabled(activeTab === 'user_banner')
      : null
  );
}
