import { AllowedImageSize, DynamicImageFormat, GuildMember, User } from 'discord.js';

export function avatar(
  user: GuildMember | User,
  size: string | number | AllowedImageSize = 2048,
  format?: string | DynamicImageFormat,
  dynamic: boolean = true
) {
  return user.displayAvatarURL({
    ...(dynamic ? { format: format as DynamicImageFormat } : {}),
    size: (typeof size === 'string' ? parseInt(size) : size) as AllowedImageSize,
    format: format as DynamicImageFormat,
    dynamic,
  });
}
