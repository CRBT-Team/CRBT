import {
  CDNImageFormat,
  CDNImageSize,
  resolveMemberAvatarURL,
  resolveUserAvatarURL,
  UserOrMemberWithAvatarLike,
} from '@purplet/utils';
import { GuildMember } from 'discord.js';

export function avatar(
  user: UserOrMemberWithAvatarLike | GuildMember,
  size: CDNImageSize = 2048,
  format: CDNImageFormat = 'png',
  dynamic: boolean = true
) {
  if (user instanceof GuildMember) {
    return resolveMemberAvatarURL(user.guild.id, user, {
      format,
      size,
    });
  }
  return resolveUserAvatarURL(user, {
    format,
    size,
  });
  // return user.displayAvatarURL({
  //   ...(dynamic ? { format: format as DynamicImageFormat } : {}),
  //   size: (typeof size === 'string' ? parseInt(size) : size) as AllowedImageSize,
  //   format: format as DynamicImageFormat,
  //   dynamic,
  // });
}
