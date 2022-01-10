import { avatar } from '$lib/functions/avatar';
import { button } from '$lib/functions/button';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import {
  AllowedImageSize,
  DynamicImageFormat,
  MessageActionRow,
  MessageEmbed,
  User,
} from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'user banner',
  description: `Gets a user's Discord profile banner, or yours if you don't specify one.`,
  options: new OptionBuilder()
    .user('user', 'The user to get the profile banner of.')
    .enum('size', 'The size of the profile banner.', [
      {
        name: 'Small (128x128px)',
        value: '128',
      },
      {
        name: 'Medium (512x512px)',
        value: '512',
      },
      {
        name: 'Default (2048x2048px)',
        value: '2048',
      },
      {
        name: 'Large (4096x4096px)',
        value: '4096',
      },
    ])
    .enum('format', 'The format of the profile banner.', [
      {
        name: 'PNG',
        value: 'png',
      },
      {
        name: 'JPG',
        value: 'jpg',
      },
      {
        name: 'WEBP',
        value: 'webp',
      },
      {
        name: 'GIF',
        value: 'gif',
      },
    ]),
  async handle({ user, size, format }) {
    const u = user ?? this.user;
    const banner = await getBanner(u, size ?? 2048, format ?? 'png', !!format);

    if (!banner) return this.reply(CRBTError(this, "This user doesn't have any profile banner!"));

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `${u.tag} - Discord profile banner`, iconURL: avatar(u, 64) })
          .setImage(banner)
          .setColor(await getColor(this.user)),
      ],
      components: [
        new MessageActionRow().addComponents(
          button(
            'LINK',
            `Download (${size ?? 2048}px - ${(banner.includes('.gif')
              ? 'GIF'
              : format ?? 'png'
            ).toUpperCase()})`,
            banner
          )
        ),
      ],
    });
  },
});

async function getBanner(
  user: User,
  size: string | number | AllowedImageSize = 2048,
  format: string | DynamicImageFormat = 'png',
  dynamic: boolean = true
) {
  const u = await user.fetch();
  return u.bannerURL({
    format: format as DynamicImageFormat,
    size: (typeof size === 'string' ? parseInt(size) : size) as AllowedImageSize,
    dynamic,
  });
}
