import { emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { getColor } from '$lib/functions/getColor';
import { keyPerms } from '$lib/functions/keyPerms';
import dayjs from 'dayjs';
import {
  GuildMember,
  Interaction,
  MessageEmbed,
  User,
  UserContextMenuInteraction,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, UserContextCommand } from 'purplet';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from '../components/navBar';

export default ChatCommand({
  name: 'user info',
  description: "Get a user's Discord information.",
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to get yours.'),
  async handle({ user }) {
    const u = await (user ?? this.user).fetch();
    const m = (user ? this.options.getMember('user') : this.member) as GuildMember;
    // const m = this.guild.members.cache.has(u.id) ? await this.guild.members.fetch(u.id) : null;

    // enum UserStatus {
    //   online = 'https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png',
    //   idle = 'https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png',
    //   dnd = 'https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png',
    //   offline = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    //   invisible = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    // }

    // const acts = activities(m);
    // if (m.presence && acts.length > 0)
    //   if (acts.length === 1) e.addField('Activity', acts.toString(), true);
    //   else e.addField(`Activities (${acts.length})`, `• ${acts.join('\n• ')}`, true);

    // if (m.presence && m.presence.activities.filter((a) => a.type === 'CUSTOM').length > 0)
    //   e.addField('Custom status', `${customStatus(m)}`, true);
    await this.reply(
      await renderUser(
        this,
        u,
        {
          cmdUID: this.user.id,
          userId: u.id,
        },
        m
      )
    );
  },
});

export const ctxCommand = UserContextCommand({
  name: 'Get User Info',
  async handle(user) {
    const member = (this as UserContextMenuInteraction).targetMember as GuildMember;

    await this.reply({
      ...(await renderUser(
        this,
        user,
        {
          cmdUID: this.user.id,
          userId: user.id,
        },
        member
      )),
      ephemeral: true,
    });
  },
});

// function customStatus(member: GuildMember) {
//   const status = member.presence.activities.find((a) => a.type === 'CUSTOM');
//   if (!status) return null;
//   else return status.emoji ? `${status.emoji} ${status.state}` : status.state;
// }

// function activities(member: GuildMember) {
//   const acts = [];
//   if (!member.presence || member.presence.status.match(/offline|invisible/)) return null;
//   for (const activity of member.presence.activities.values()) {
//     switch (activity.type) {
//       case 'STREAMING':
//         acts.push(`Streaming **[${activity.name}](${activity.url})** on **${activity.details}**`);
//         break;

//       case 'LISTENING':
//         if (activity.name === 'Spotify')
//           acts.push(
//             `<:spotify:771863394709536768> **[${activity.details}](https://open.spotify.com/track/${activity.syncId})**`
//           );
//         else acts.push(`Listening to **${activity.name}**`);
//         break;

//       case 'PLAYING':
//         // if (activity.state) acts.push(`**${activity.name}**, ${activity.state}`);
//         acts.push(`${activity.name}`);
//         break;

//       case 'WATCHING':
//         acts.push(`Watching ${activity.name}`);
//         break;
//       case 'COMPETING':
//         acts.push(`Competing in ${activity.name}`);
//         break;
//     }
//   }
//   return acts;
// }

export async function renderUser(
  ctx: Interaction,
  user: User,
  navCtx: NavBarContext,
  member?: GuildMember
) {
  const { badges } = emojis;
  const flags = (await user.fetchFlags()).toArray();
  const userBadges = flags.map((flag) => {
    switch (flag) {
      case 'VERIFIED_BOT':
        return badges.verifiedBot;
      case 'DISCORD_EMPLOYEE':
        return badges.discordStaff;
      case 'PARTNERED_SERVER_OWNER':
        return badges.partner;
      case 'DISCORD_CERTIFIED_MODERATOR':
        return badges.cerifiedMod;
      case 'HYPESQUAD_EVENTS':
        return badges.hypesquad;
      case 'HOUSE_BRILLIANCE':
        return badges.houses.brilliance;
      case 'HOUSE_BALANCE':
        return badges.houses.balance;
      case 'HOUSE_BRAVERY':
        return badges.houses.bravery;
      case 'BUGHUNTER_LEVEL_1':
        return badges.bugHunter1;
      case 'BUGHUNTER_LEVEL_2':
        return badges.bugHunter1;
      case 'EARLY_SUPPORTER':
        return badges.earlySupporter;
      case 'EARLY_VERIFIED_BOT_DEVELOPER':
        return badges.developer;
    }
  });
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  const e = new MessageEmbed()
    .setAuthor({
      name: `${user.tag} - User info`,
      iconURL: avatar(member ?? user, 64),
    })
    .setDescription(userBadges.join('‎ '))
    .addField('ID', user.id)
    .setImage(banner(user, size ?? 2048, format))
    .setThumbnail(avatar(member ?? user, size ?? 256, format))
    .setColor(await getColor(user));

  const joinedDiscord = dayjs(user.createdAt).unix();

  if (member) {
    const roles = member.roles.cache.filter((r) => r.id !== ctx.guild.id);
    const joinedServer = dayjs(member.joinedAt).unix();

    if (member.nickname) e.addField('Server nickname', member.nickname);

    e.addField(
      `${roles.size === 1 ? 'Role' : 'Roles'} (${roles.size})`,
      roles.size > 0
        ? roles.map((r) => r.toString()).join(' ')
        : "*This user doesn't have any roles...*"
    )
      .addField(
        `Global major permissions`,
        member.permissions.has('ADMINISTRATOR', true) || member.permissions.toArray().length === 0
          ? 'Administrator (all permissions)'
          : keyPerms(member.permissions).join(', ')
      )
      .addField('Joined Discord', `<t:${joinedDiscord}>\n<t:${joinedDiscord}:R>`, true)
      .addField('Joined server', `<t:${joinedServer}>\n<t:${joinedServer}:R>`, true);
  } else {
    e.addField('Joined Discord', `<t:${joinedDiscord}> (<t:${joinedDiscord}:R>)`);
  }
  return {
    embeds: [e],
    components: components(
      navBar(navCtx, ctx.locale, 'userinfo', getTabs('userinfo', user, member))
    ),
  };
}
