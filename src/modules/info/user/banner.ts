import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { createCRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { GuildMember, Interaction, MessageButton, MessageEmbed, User } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from './_navbar';

export default ChatCommand({
  name: 'banner',
  description: `Get a user's Profile Banner.`,
  options: new OptionBuilder()

    .user('user', 'The user to get the banner of.')
    .string('size', 'The size of the banner to get.', {
      choices: {
        '1': 'Small (128px)',
        '2': 'Medium (512px)',
        '3': 'Large (2048px)',
        '4': 'Largest (4096px)',
      },
    })
    .string('format', 'The format of the banner to get.', {
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
    const u = user ?? this.user;

    await this.reply(
      await renderBanner(
        'user',
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
      `${user.id === ctx.user.id ? "You don't" : "This user doesn't"} have any profile banner!`
    );

  const color = ctx.isButton() ? ctx.message.embeds[0].color : await getColor(user);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${user.tag} - Banner`,
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
        getTabs('user_banner', user, member)
      ),
      row(
        new MessageButton()
          .setStyle('LINK')
          .setLabel(
            `Download (${size ?? 2048}px - ${(b.includes('.gif')
              ? 'GIF'
              : format ?? 'png'
            ).toUpperCase()})`
          )
          .setURL(b)
      )
    ),
  };
}
