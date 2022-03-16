import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { AllowedImageSize, DynamicImageFormat, MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'server icon',
  description: `Get a chosen server's icon or the current server's icon.`,
  options: new OptionBuilder()
    .string('id', 'The ID of the server to get the icon of.')
    .enum(
      'size',
      'The size of the icon.',
      [
        ['Small', 128],
        ['Medium', 512],
        ['Default', 2048],
        ['Large', 4096],
      ].map(([name, size]) => ({ name: `${name} (${size}x${size}px)`, value: `${size}` }))
    )
    .enum(
      'format',
      'The format of the icon.',
      ['png', 'jpg', 'webp', 'gif'].map((value) => ({ name: value.toUpperCase(), value }))
    ),
  async handle({ id, size, format }) {
    if ((this.channel.type === 'DM' && !id) || (id && !this.client.guilds.cache.has(id)))
      return await this.reply(
        CRBTError(
          `The server ID that you used is either invalid, or I'm not part of that server! To invite me, use this link: crbt.ga/invite.`
        )
      );

    const guild = !id ? await this.guild.fetch() : await this.client.guilds.fetch(id);

    const av = guild.iconURL({
      size: parseInt(size ?? '2048') as AllowedImageSize,
      format: (format ?? 'png') as DynamicImageFormat,
      dynamic: !!format,
    });
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `${guild.name} - Server icon`, iconURL: av })
          .setImage(av)
          .setColor(await getColor(this.user)),
      ],
      components: components(
        row(
          new MessageButton()
            .setStyle('LINK')
            .setLabel(
              !av.includes('embed/avatars')
                ? `Download (${size ?? 2048}px - ${(av.includes('.gif')
                    ? 'GIF'
                    : format ?? 'png'
                  ).toUpperCase()})`
                : 'Download (256px - PNG)'
            )
            .setURL(av)
        )
      ),
    });
  },
});
