import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages } from '$lib/language';
import {
  AllowedImageSize,
  DynamicImageFormat,
  Guild,
  Interaction,
  MessageButton,
  MessageComponentInteraction,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import { AvatarFormats, AvatarSizes, NavBarContext } from '../user/_navbar';
import { getTabs, serverNavBar } from './_navbar';

export default ChatCommand({
  name: 'server icon',
  description: `Get this server's icon, or another one's.`,
  options: new OptionBuilder()
    .string('id', 'The ID of the server to get the icon of.', {
      nameLocalizations: getAllLanguages('ID', localeLower),
    })
    .string('size', 'The size of the icon to get.', {
      nameLocalizations: getAllLanguages('SIZE', localeLower),
      choices: {
        '1': 'Small (128px)',
        '2': 'Medium (512px)',
        '3': 'Large (2048px)',
        '4': 'Largest (4096px)',
      },
    })
    .string('format', 'The format of the icon to get.', {
      nameLocalizations: getAllLanguages('FORMAT', localeLower),
      choices: {
        '1': 'PNG',
        '2': 'JPG',
        '3': 'WEBP',
        '4': 'GIF',
      },
    }),
  async handle({ id, size, format }) {
    if ((!this.guild && !id) || (id && !this.client.guilds.cache.has(id)))
      return await CRBTError(this, {
        title: "The ID you have used is either invalid, or I'm not part of this server.",
        description: `You can also **[invite me to it]($[links.invite])**, if you have permission to.`,
      });

    const guild = !id ? await this.guild.fetch() : await this.client.guilds.fetch(id);

    await this.reply(
      await renderServerIcon.call(this, guild, {
        targetId: this.guildId,
        userId: this.user.id,
        size: (size ?? '3') as any,
        format: format as any,
      })
    );
  },
});

export async function renderServerIcon(this: Interaction, guild: Guild, navCtx: NavBarContext) {
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  const av = guild.iconURL({
    size: (size ?? parseInt('2048')) as AllowedImageSize,
    format: (format ?? 'png') as DynamicImageFormat,
    dynamic: !!format,
  });

  const color =
    this instanceof MessageComponentInteraction
      ? this.message.embeds[0].color
      : await getColor(this.guild);

  return {
    embeds: [
      {
        author: { name: `${guild.name} - Server icon`, iconURL: av },
        image: { url: av },
        color,
      },
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
      ),
      serverNavBar(navCtx, this.locale, 'icon', getTabs('icon', guild))
    ),
  };
}
