import { avatar } from '$lib/functions/avatar';
import { button } from '$lib/functions/button';
import { getColor } from '$lib/functions/getColor';
import { MessageActionRow, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'user pfp',
  description: `Gets a user's profile picture, or yours if you don't specify one.`,
  options: new OptionBuilder()
    .user('user', 'The user to get the profile picture of.')
    .enum('size', 'The size of the profile picture.', [
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
    .enum('format', 'The format of the profile picture.', [
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
    const av = avatar(u, size ?? 2048, format ?? 'png', !!format);
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `${u.tag} - Profile picture`, iconURL: avatar(u, 64) })
          .setImage(av)
          .setColor(await getColor(this.user)),
      ],
      components: [
        new MessageActionRow().addComponents(
          button(
            'LINK',
            !av.includes('embed/avatars')
              ? `Download (${size ?? 2048}px - ${(av.includes('.gif')
                  ? 'GIF'
                  : format ?? 'png'
                ).toUpperCase()})`
              : 'Download (256px - PNG)',
            av
          )
        ),
      ],
    });
  },
});
