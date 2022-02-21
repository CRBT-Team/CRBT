import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row, UserContextCommand } from 'purplet';

export default ChatCommand({
  name: 'user pfp',
  description: `Gets a user's avatar, or yours if you don't specify one.`,
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
    const av = avatar(u, size ?? 2048, format ?? 'png', !!format);
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `${u.tag} - Avatar`, iconURL: avatar(u, 64) })
          .setImage(av)
          .setColor(await getColor(u)),
      ],
      components: components(
        row(
          new MessageButton()
            .setLabel(
              !av.includes('embed/avatars')
                ? `Download (${size ?? 2048}px - ${(av.includes('.gif')
                    ? 'GIF'
                    : format ?? 'png'
                  ).toUpperCase()})`
                : 'Download (256px - PNG)'
            )
            .setStyle('LINK')
            .setURL(av)
        )
      ),
    });
  },
});

export const ctxCommand = UserContextCommand({
  name: 'Get Avatar',
  async handle(user) {
    const av = avatar(user, 2048, 'png', true);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `${user.tag} - Avatar`, iconURL: avatar(user, 64) })
          .setImage(av)
          .setColor(await getColor(user)),
      ],
      components: components(
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
      ephemeral: true,
    });
  },
});

// export const Btn = ButtonComponent({
//   handle() {
//     this;
//   },
// });

// SelectMenuComponent({
//   handle() {},
// });

// new Btn();
