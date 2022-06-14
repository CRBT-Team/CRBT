import { avatar } from '$lib/functions/avatar';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { ButtonInteraction, Interaction, MessageButton, MessageEmbed, User } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row, UserContextCommand } from 'purplet';
import { navBar } from '../components/navBar';

const { meta, ctxMeta } = t('en-US', 'avatar');

export default ChatCommand({
  name: 'avatar default',
  description: meta.description,
  options: new OptionBuilder()
    .user('user', meta.options[0].description)
    .string('size', meta.options[1].description, {
      choices: {
        [128]: 'Small (128px)',
        [512]: 'Medium (512px)',
        [4096]: 'Largest (4096px)',
      },
    })
    .string('format', meta.options[2].description, {
      choices: {
        png: 'PNG',
        jpg: 'JPG',
        webp: 'WEBP',
        gif: 'GIF',
      },
    }),
  async handle({ user, size, format }) {
    const u = user ?? this.user;
    await this.reply(await renderPfp(u, this, size, format));
  },
});

export const ctxCommand = UserContextCommand({
  ...ctxMeta,
  async handle(user) {
    await this.reply({
      ...(await renderPfp(user, this)),
      ephemeral: true,
    });
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
  const { strings } = t(ctx.locale, 'avatar');

  const av = avatar(user, size, format ?? 'png', !!format);

  const color =
    ctx instanceof ButtonInteraction ? ctx.message.embeds[0].color : await getColor(user);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          // name: user.tag,
          name: strings.EMBED_TITLE.replace('<USER>', user.tag),
          iconURL: avatar(user, 64),
        })
        .setImage(av)
        .setColor(color),
    ],
    components: components(
      navBar(navCtx ?? { userId: user.id, cmdUID: ctx.user.id }, ctx.locale, 'avatar'),
      row(
        new MessageButton()
          .setLabel(
            !av.includes('embed/avatars')
              ? strings.DOWNLOAD.replace('<SIZE>', `${size}`).replace(
                  '<FORMAT>',
                  av.includes('.gif') ? 'GIF' : 'PNG'
                )
              : strings.DOWNLOAD.replace('<SIZE>', `256`).replace('<FORMAT>', 'PNG')
          )
          .setStyle('LINK')
          .setURL(av)
      )
    ),
  };
}
