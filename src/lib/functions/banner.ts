import { CDNImageFormat, CDNImageSize, formatUserBannerURL } from '@purplet/utils';

export interface UserOrMemberWithBannerLike {
  id?: string;
  discriminator?: string;
  user?: {
    id?: string;
    username?: string;
    banner?: string;
  };
  banner?: string;
}

export function banner(
  user: UserOrMemberWithBannerLike,
  size: CDNImageSize = 2048,
  format: CDNImageFormat = 'png'
) {
  if (!user.banner) {
    return null;
  }
  return formatUserBannerURL(user.id, user.banner, {
    format,
    size,
  });
}
