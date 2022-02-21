import { links } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { AllowedImageSize, DynamicImageFormat, MessageButton, MessageEmbed } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

export default ChatCommand({
  name: 'server icon',
  description: `Gets a server's icon with its ID, or of the current one if none is used.`,
  options: new OptionBuilder()
    .string('id', 'ID of the server you want to get the icon from. Defaults to the current server.')
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
    .enum('format', 'The format of the icon.', [
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
  async handle({ id, size, format }) {
    if (this.channel.type === 'DM' && !id || id && !this.client.guilds.cache.has(id))
      return await this.reply(
        CRBTError(
          `The server ID that you used is either invalid, or I'm not part of that server! If you want to invite me over there, click **[here](${links.invite})**.`,
          `Who's that?`
        )
      );

    const guild = !id ? await this.guild.fetch() : await this.client.guilds.fetch(id);

    const av = guild.iconURL({
      size: (size ?? 2048) as AllowedImageSize,
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
