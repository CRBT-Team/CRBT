import { avatar } from '$lib/functions/avatar';
import { formatDisplayName, formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { APIUser, MessageFlags, Routes } from 'discord-api-types/v10';
import { ButtonInteraction, GuildMember, Interaction, MessageButton } from 'discord.js';
import {
  ChatCommand,
  OptionBuilder,
  UserContextCommand,
  components,
  getRestClient,
  row,
} from 'purplet';
import { ShareResponseBtn } from '../../components/ShareResult';
import { AvatarFormats, AvatarSizes, NavBarContext, getTabs, navBar } from './_navbar';

const { ctxMeta } = t('en-US', 'avatar');

export const defaultPfp = ChatCommand({
  name: 'avatar',
  description: t('en-US', 'avatar.meta.description'),
  nameLocalizations: getAllLanguages('AVATAR', localeLower),
  descriptionLocalizations: getAllLanguages('avatar.meta.description'),
  options: new OptionBuilder()
    .user('user', t('en-US', 'USER_TYPE_COMMAND_OPTION_DESCRIPTION'), {
      nameLocalizations: getAllLanguages('USER', localeLower),
      descriptionLocalizations: getAllLanguages('USER_TYPE_COMMAND_OPTION_DESCRIPTION'),
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
      // choiceLocalizations: {
      //   '1': getAllLanguages('SMALL', (str) => `${str} (128px)`),
      //   '2': getAllLanguages('MEDIUM', (str) => `${str} (512px))`),
      //   '3': getAllLanguages('LARGE', (str) => `${str} (2048px)`),
      //   '4': getAllLanguages('LARGEST', (str) => `${str} (4096px)`),
      // },
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
    const u = (await getRestClient().get(Routes.user((user ?? this.user).id))) as APIUser;

    await this.reply(
      await renderPfp(
        'default',
        u,
        this,
        {
          targetId: u.id,
          userId: this.user.id,
          format: format as any,
          size: (size ?? '3') as any,
        },
        m,
      ),
    );
  },
});

export const ctxDefaultPfp = UserContextCommand({
  ...ctxMeta,
  async handle(user) {
    const m = this.options.getMember('user') as GuildMember;
    const u = (await getRestClient().get(Routes.user(user.id))) as APIUser;

    await this.reply({
      ...(await renderPfp(
        'default',
        u,
        this,
        {
          targetId: user.id,
          userId: this.user.id,
          size: '3',
        },
        m,
      )),
      ephemeral: true,
    });
  },
});

export async function renderPfp(
  type: 'default' | 'user',
  user: APIUser,
  ctx: Interaction,
  navCtx: NavBarContext,
  member?: GuildMember,
) {
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  const { strings } = t(ctx.locale, 'avatar');

  const av = avatar(type === 'user' ? user : member ?? user, size, format, !format);

  const color =
    ctx instanceof ButtonInteraction ? ctx.message.embeds[0].color : await getColor(user);

  return {
    embeds: [
      {
        author: {
          name: `${formatUsername(user)} - ${t(
            ctx,
            type === 'default' ? 'AVATAR' : 'USER_AVATAR',
          )}`,
          icon_url: av,
        },
        title: formatDisplayName(user, member),
        image: {
          url: av,
        },
        color,
      },
    ],
    flags: MessageFlags.Ephemeral,
    components: components(
      navBar(
        navCtx,
        ctx.locale,
        type === 'default' ? 'avatar' : 'user_avatar',
        getTabs(type === 'default' ? 'avatar' : 'user_avatar', user, member),
      ),
      row(
        new MessageButton({
          style: 'LINK',
          url: av,
          label: !av.includes('embed/avatars')
            ? strings.DOWNLOAD.replace('{SIZE}', `${size ?? 2048}`).replace(
                '{FORMAT}',
                av.includes('.gif') ? 'GIF' : format?.toUpperCase() ?? 'PNG',
              )
            : strings.DOWNLOAD.replace('{SIZE}', `256`).replace('{FORMAT}', 'PNG'),
        }),
        ShareResponseBtn(ctx, false),
      ),
    ),
  };
}
