import { links } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ButtonStyle } from 'discord-api-types/v10';
import {
  AllowedImageSize,
  DynamicImageFormat,
  Guild,
  Interaction,
  MessageComponentInteraction,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import { AvatarFormats, AvatarSizes, NavBarContext } from '../user/_navbar';
import { getTabs, serverNavBar } from './_navbar';

export default ChatCommand({
  name: 'server icon',
  description: t('en-US', 'server_icon.description'),
  options: new OptionBuilder()
    .string('id', t('en-US', 'server_icon.options.id.description'), {
      nameLocalizations: getAllLanguages('ID', localeLower),
      descriptionLocalizations: getAllLanguages('server_icon.options.id.description'),
    })
    .string('size', t('en-US', 'avatar.meta.options.size.description'), {
      nameLocalizations: getAllLanguages('SIZE', localeLower),
      descriptionLocalizations: getAllLanguages('avatar.meta.options.size.description'),
      choices: {
        '1': 'Small (128px)',
        '2': 'Medium (512px)',
        '3': 'Large (2048px)',
        '4': 'Largest (4096px)',
      },
    })
    .string('format', t('en-US', 'avatar.meta.options.format.description'), {
      nameLocalizations: getAllLanguages('FORMAT', localeLower),
      descriptionLocalizations: getAllLanguages('avatar.meta.options.format.description'),
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
        title: t(this, 'SERVER_INFO_ERROR_INVALID_SERVER_TITLE'),
        description: t(this, 'SERVER_INFO_ERROR_INVALID_SERVER_DESCRIPTION', {
          link: links.invite,
        }),
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
        author: { name: `${guild.name} - ${t(this, 'ICON')}`, iconURL: av },
        image: { url: av },
        color,
      },
    ],
    components: components(
      row({
        type: 'BUTTON',
        style: ButtonStyle.Link,
        url: av,
        label: t(this, 'avatar.strings.DOWNLOAD', {
          SIZE: av.includes('embed/avatars') ? '256' : `${size ?? 2048}`,
          FORMAT: av.includes('embed/avatars')
            ? 'PNG'
            : av.includes('.gif')
            ? 'GIF'
            : format?.toUpperCase() ?? 'PNG',
        }),
      }),
      serverNavBar(navCtx, this.locale, 'icon', getTabs('icon', guild))
    ),
  };
}
