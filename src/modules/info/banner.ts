import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import {
  AllowedImageSize,
  DynamicImageFormat,
  MessageButton,
  MessageEmbed,
  User,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'banner',
  description: `Get the Discord profile banner of a chosen user, or yours by default.`,
  options: new OptionBuilder()

    .user('user', 'The user to get the profile banner of.')
    .string('size', 'The size of the profile banner to get.', {
      choices: {
        [128]: 'Small (128px)',
        [512]: 'Medium (512px)',
        [4096]: 'Largest (4096px)',
      },
    })
    .string('format', 'The format of the profile banner to get.', {
      choices: {
        png: 'PNG',
        jpg: 'JPG',
        webp: 'WEBP',
        gif: 'GIF',
      },
    }),
  async handle({ user, size, format }) {
    const u = user ?? this.user;
    const banner = await getBanner(u, size ?? 2048, format ?? 'png', !!format);

    if (!banner)
      return this.reply(
        CRBTError(
          `${u.id === this.user.id ? "You don't" : "This user doesn't"} have any profile banner!`
        )
      );

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `${u.tag} - Discord profile banner`, iconURL: avatar(u, 64) })
          .setImage(banner)
          .setColor(await getColor(this.user)),
      ],
      components: components(
        row(
          new MessageButton()
            .setStyle('LINK')
            .setLabel(
              `Download (${size ?? 2048}px - ${(banner.includes('.gif')
                ? 'GIF'
                : format ?? 'png'
              ).toUpperCase()})`
            )
            .setURL(banner)
        )
      ),
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
