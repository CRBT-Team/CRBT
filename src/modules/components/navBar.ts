import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { ButtonComponent, row } from 'purplet';
import { renderProfile } from '../economy/profile';
import { renderUser } from '../info/user info';
import { renderPfp } from '../info/user pfp';

export const UserInfoBtn = ButtonComponent({
  async handle({ userId, cmdUID }: { userId: string; cmdUID: string }) {
    if (this.user.id !== cmdUID) {
      return this.reply(CRBTError('Only the person who used this command can use this button.'));
    }
    const u = this.client.users.cache.get(userId);
    this.update(
      await renderUser(this, u, this.guild.members.cache.get(userId), { userId, cmdUID })
    );
  },
});

export const PfpBtn = ButtonComponent({
  async handle({ userId, cmdUID }: { userId: string; cmdUID: string }) {
    if (this.user.id !== cmdUID) {
      return this.reply(CRBTError('Only the person who used this command can use this button.'));
    }
    await this.update(
      await renderPfp(this.client.users.cache.get(userId), this, '2048', 'png', { userId, cmdUID })
    );
  },
});

export const ProfileBtn = ButtonComponent({
  async handle({ userId, cmdUID }: { userId: string; cmdUID: string }) {
    if (this.user.id !== cmdUID) {
      return this.reply(CRBTError('Only the person who used this command can use this button.'));
    }
    const u = this.client.users.cache.get(userId) ?? (await this.client.users.fetch(userId));
    const profile = (await db.profiles.findFirst({
      where: { id: userId },
    })) as APIProfile;

    this.update(await renderProfile(profile, u, this.guild, this, { userId, cmdUID }));
  },
});

export function navBar(
  ctx: { userId: string; cmdUID: string },
  tab: 'profile' | 'pfp' | 'userinfo'
) {
  return row(
    new ProfileBtn(ctx)
      .setLabel('Profile')
      .setStyle('SECONDARY')
      .setDisabled(tab === 'profile'),
    new PfpBtn(ctx)
      .setLabel('Avatar')
      .setStyle('SECONDARY')
      .setDisabled(tab === 'pfp'),
    new UserInfoBtn(ctx)
      .setLabel('User info')
      .setStyle('SECONDARY')
      .setDisabled(tab === 'userinfo')
  );
}
