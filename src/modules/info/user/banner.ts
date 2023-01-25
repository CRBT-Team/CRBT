import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { createCRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { ButtonStyle } from 'discord-api-types/v10';
import { GuildMember, Interaction, MessageEmbed, User } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from './_navbar';

export default ChatCommand({
  name: 'banner',
  description: t('en-US', 'banner.description'),
  nameLocalizations: getAllLanguages('BANNER', localeLower),
  descriptionLocalizations: getAllLanguages('banner.description'),
  options: new OptionBuilder()
    .user('user', t('en-US', 'banner.options.user.description'), {
      nameLocalizations: getAllLanguages('USER', localeLower),
      descriptionLocalizations: getAllLanguages('banner.options.user.description'),
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
  async handle({ user, size, format }) {
    const m = user
      ? (this.options.getMember('user') as GuildMember) ?? null
      : (this.member as GuildMember);
    user ??= this.user;

    await this.reply(
      await renderBanner(
        'user',
        user,
        this,
        {
          targetId: user.id,
          userId: this.user.id,
          format: format as any,
          size: (size ?? '3') as any,
        },
        m
      )
    );
  },
});

export async function renderBanner(
  type: 'default' | 'user' = 'user',
  user: User,
  ctx: Interaction,
  navCtx: NavBarContext,
  member?: GuildMember
) {
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  const b = banner(await user.fetch(), size ?? 2048, format);

  if (!ctx.isButton() && !b)
    return createCRBTError(
      ctx,
      t(
        ctx,
        user.id === ctx.user.id
          ? 'USER_BANNER_ERROR_NO_BANNER_SELF'
          : 'USER_BANNER_ERROR_NO_BANNER_OTHER'
      )
    );

  const color = ctx.isButton() ? ctx.message.embeds[0].color : await getColor(user);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${user.tag} - ${t(ctx, 'USER_BANNER')}`,
          iconURL: avatar(member ?? user, 64),
        })
        .setImage(b)
        .setColor(color),
    ],
    components: components(
      navBar(
        navCtx,
        ctx.locale,
        type === 'default' ? 'banner' : 'user_banner',
        getTabs('user_banner', user.toJSON(), member)
      ),
      row({
        type: 'BUTTON',
        style: ButtonStyle.Link,
        url: b,
        label: t(ctx, 'avatar.strings.DOWNLOAD', {
          SIZE: `${size ?? 2048}`,
          FORMAT: b.includes('.gif') ? 'GIF' : format?.toUpperCase() ?? 'PNG',
        }),
      })
    ),
  };
}
