import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import {
  ButtonInteraction,
  GuildMember,
  Interaction,
  MessageButton,
  MessageEmbed,
  User,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, row, UserContextCommand } from 'purplet';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from './_navbar';

const { meta, ctxMeta } = t('en-US', 'avatar');

const options = new OptionBuilder()
  .user('user', meta.options[0].description)
  .string('size', meta.options[1].description, {
    choices: {
      '1': 'Small (128px)',
      '2': 'Medium (512px)',
      '3': 'Large (2048px)',
      '4': 'Largest (4096px)',
    },
  })
  .string('format', meta.options[2].description, {
    choices: {
      '1': 'PNG',
      '2': 'JPG',
      '3': 'WEBP',
      '4': 'GIF',
    },
  });

export const defaultPfp = ChatCommand({
  name: 'avatar',
  description: meta.description,
  options,
  async handle({ user, size, format }) {
    const m = user
      ? (this.options.getMember('user') as GuildMember) ?? null
      : (this.member as GuildMember);
    const u = user ?? this.user;

    console.log(size, format);

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
        m
      )
    );
  },
});

export const ctxDefaultPfp = UserContextCommand({
  ...ctxMeta,
  async handle(user) {
    const m = this.options.getMember('user') as GuildMember;
    await this.reply({
      ...(await renderPfp(
        'default',
        user,
        this,
        {
          targetId: user.id,
          userId: this.user.id,
          size: '3',
        },
        m
      )),
      ephemeral: true,
    });
  },
});

export async function renderPfp(
  type: 'default' | 'user',
  user: User,
  ctx: Interaction,
  navCtx: NavBarContext,
  member?: GuildMember
) {
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  console.log(size, format);

  const { strings } = t(ctx.locale, 'avatar');

  const av = avatar(type === 'user' ? user : member ?? user, size, format, !format);

  console.log(av);

  const color =
    ctx instanceof ButtonInteraction ? ctx.message.embeds[0].color : await getColor(user);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: strings.EMBED_TITLE.replace('<USER>', user.tag),
          iconURL: av,
        })
        .setImage(av)
        .setColor(color),
    ],
    components: components(
      navBar(
        navCtx,
        ctx.locale,
        type === 'default' ? 'avatar' : 'user_avatar',
        getTabs(type === 'default' ? 'avatar' : 'user_avatar', user, member)
      ),
      row(
        new MessageButton()
          .setLabel(
            !av.includes('embed/avatars')
              ? strings.DOWNLOAD.replace('<SIZE>', `${size ?? 2048}`).replace(
                  '<FORMAT>',
                  av.includes('.gif') ? 'GIF' : format?.toUpperCase() ?? 'PNG'
                )
              : strings.DOWNLOAD.replace('<SIZE>', `256`).replace('<FORMAT>', 'PNG')
          )
          .setStyle('LINK')
          .setURL(av)
      )
    ),
  };
}
