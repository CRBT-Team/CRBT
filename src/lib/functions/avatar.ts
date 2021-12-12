import { AllowedImageSize, DynamicImageFormat, User } from 'discord.js';

export function avatar(
  user: User,
  size: string | number | AllowedImageSize = 2048,
  format: string | DynamicImageFormat = 'png',
  dynamic: boolean = true
) {
  return user.displayAvatarURL({
    format: format as DynamicImageFormat,
    size: (typeof size === 'string' ? parseInt(size) : size) as AllowedImageSize,
    dynamic,
  });
}
