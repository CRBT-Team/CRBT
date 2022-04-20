import { CRBTUser } from '$lib/classes/CRBTUser';
import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getStrings } from '$lib/language';
import { ButtonComponent, row } from 'purplet';
import { renderProfile } from '../economy/profile';
import { renderPfp } from '../info/avatar';
import { renderUser } from '../info/user info';

export const UserInfoBtn = ButtonComponent({
  async handle({ userId, cmdUID }: { userId: string; cmdUID: string }) {
    const { errors } = getStrings(this.locale).user_navbar;

    if (this.user.id !== cmdUID) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const m = this.guild.members.cache.get(userId) ?? (await this.guild.members.fetch(userId));
    this.update(await renderUser(this, m.user, m, { userId, cmdUID }));
  },
});

export const PfpBtn = ButtonComponent({
  async handle({ userId, cmdUID }: { userId: string; cmdUID: string }) {
    const { errors } = getStrings(this.locale).user_navbar;

    if (this.user.id !== cmdUID) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    await this.update(
      await renderPfp(this.client.users.cache.get(userId), this, '2048', 'png', { userId, cmdUID })
    );
  },
});

export const ProfileBtn = ButtonComponent({
  async handle({ userId, cmdUID }: { userId: string; cmdUID: string }) {
    const { errors } = getStrings(this.locale).user_navbar;

    if (this.user.id !== cmdUID) {
      return this.reply(CRBTError(errors.NOT_CMD_USER));
    }
    const u = this.client.users.cache.get(userId) ?? (await this.client.users.fetch(userId));
    const profile = new CRBTUser(
      u,
      await db.profiles.findFirst({
        where: { id: userId },
      })
    );

    this.update({ ...(await renderProfile(profile, this, { userId, cmdUID })) });
  },
});

export function navBar(
  ctx: { userId: string; cmdUID: string },
  locale: string,
  tab: 'profile' | 'pfp' | 'userinfo'
) {
  const { strings } = getStrings(locale).user_navbar;

  return row(
    new ProfileBtn(ctx)
      .setLabel(strings.PROFILE)
      .setStyle('SECONDARY')
      .setDisabled(tab === 'profile'),
    new PfpBtn(ctx)
      .setLabel(strings.AVATAR)
      .setStyle('SECONDARY')
      .setDisabled(tab === 'pfp'),
    new UserInfoBtn(ctx)
      .setLabel(strings.INFO)
      .setStyle('SECONDARY')
      .setDisabled(tab === 'userinfo')
  );
}
