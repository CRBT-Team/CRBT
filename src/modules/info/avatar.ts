import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { row } from '$lib/functions/row';
import { languages } from '$lib/language';
import { ButtonInteraction, Interaction, MessageButton, MessageEmbed, User } from 'discord.js';
import { ChatCommand, components, OptionBuilder, UserContextCommand } from 'purplet';
import { navBar } from '../components/navBar';

const { meta, ctxMeta } = languages['en-US'].avatar;

export default ChatCommand({
  ...meta,
  options: new OptionBuilder()
    .user('user', meta.options[0].description)
    .enum(
      'size',
      meta.options[1].description,
      [
        ['Small', 128],
        ['Medium', 512],
        ['Default', 2048],
        ['Large', 4096],
      ].map(([name, size]) => ({ name: `${name} (${size}x${size}px)`, value: `${size}` }))
    )
    .enum(
      'format',
      meta.options[2].description,
      ['png', 'jpg', 'webp', 'gif'].map((value) => ({ name: value.toUpperCase(), value }))
    ),
  async handle({ user, size, format }) {
    const u = user ?? this.user;
    await this.reply(await renderPfp(u, this, size, format));
  },
});

export const ctxCommand = UserContextCommand({
  ...ctxMeta,
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
  const { strings } = languages[ctx.locale].avatar;

  const av = avatar(user, size, format ?? 'png', !!format);

  const color =
    ctx instanceof ButtonInteraction ? ctx.message.embeds[0].color : await getColor(user);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: strings.EMBED_TITLE.replace('<USER>', user.tag),
          iconURL: avatar(user, 64),
        })
        .setImage(av)
        .setColor(color),
    ],
    components: components(
      navBar(navCtx ?? { userId: user.id, cmdUID: ctx.user.id }, ctx.locale, 'pfp'),
      row(
        new MessageButton()
          .setLabel(
            !av.includes('embed/avatars')
              ? `${strings.DOWNLOAD} (2048px - ${av.includes('.gif') ? 'GIF' : 'PNG'})`
              : 'Download (256px - PNG)'
          )
          .setStyle('LINK')
          .setURL(av)
      )
    ),
  };
}
