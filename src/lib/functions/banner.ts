import { AllowedImageSize, DynamicImageFormat, User } from 'discord.js';

export function banner(
  user: User,
  size: string | number | AllowedImageSize = 2048,
  format: string | DynamicImageFormat = 'png'
) {
  if (!user.banner) {
    return null;
  }
  return user.bannerURL({
    format: format as DynamicImageFormat,
    size: (typeof size === 'string' ? parseInt(size) : size) as AllowedImageSize,
    dynamic: true,
  });
}
