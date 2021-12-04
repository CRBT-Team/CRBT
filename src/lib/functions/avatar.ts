import { AllowedImageSize, DynamicImageFormat, User } from 'discord.js';

export function avatar(
  user: User,
  size: AllowedImageSize = 2048,
  format: DynamicImageFormat = 'png'
) {
  return user.displayAvatarURL({ format, size, dynamic: true });
}
