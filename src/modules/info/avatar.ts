import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { row } from '$lib/functions/row';
import { Interaction, MessageButton, MessageEmbed, User } from 'discord.js';
import { ChatCommand, components, OptionBuilder, UserContextCommand } from 'purplet';
import { navBar } from '../components/navBar';

export default ChatCommand({
  name: 'avatar',
  description: `Get a user's default avatar, or yours if you don't specify one.`,
  options: new OptionBuilder()
    .user('user', 'The user to get the avatar of.')
    .enum(
      'size',
      'The size of the avatar.',
      [
        ['Small', 128],
        ['Medium', 512],
        ['Default', 2048],
        ['Large', 4096],
      ].map(([name, size]) => ({ name: `${name} (${size}x${size}px)`, value: `${size}` }))
    )
    .enum(
      'format',
      'The format of the avatar.',
      ['png', 'jpg', 'webp', 'gif'].map((value) => ({ name: value.toUpperCase(), value }))
    ),
  async handle({ user, size, format }) {
    const u = user ?? this.user;
    await this.reply(await renderPfp(u, this, size, format));
  },
});

export const ctxCommand = UserContextCommand({
  name: 'Get Avatar',
  async handle(user) {
    await this.reply(await renderPfp(user, this));
  },
});

export async function renderPfp(
  user: User,
  ctx: Interaction,
  size = '2048',
  format?: string,
  navCtx?: {
    userId: string;
    cmdUID: string;
  }
) {
  const av = avatar(user, size, format ?? 'png', !!format);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: `${user.tag} - Avatar`, iconURL: avatar(user, 64) })
        .setImage(av)
        .setColor(await getColor(user)),
    ],
    components: components(
      navBar(navCtx ?? { userId: user.id, cmdUID: ctx.user.id }, 'pfp'),
      row(
        new MessageButton()
          .setLabel(
            !av.includes('embed/avatars')
              ? `Download (2048px - ${av.includes('.gif') ? 'GIF' : 'PNG'})`
              : 'Download (256px - PNG)'
          )
          .setStyle('LINK')
          .setURL(av)
      )
    ),
  };
}
