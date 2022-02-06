import { emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { getColor } from '$lib/functions/getColor';
import { keyPerms } from '$lib/functions/keyPerms';
import dayjs from 'dayjs';
import { GuildMember, MessageEmbed, User } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'user info',
  description: 'Get all info on a Discord user.',
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to get yours.'),
  async handle({ user }) {
    const u = await this.client.users.fetch(user ?? this.user, { force: true });
    const m: GuildMember | null = await (
      await this.guild.fetch()
    ).members
      .fetch({
        user: u,
        // withPresences: true,
        force: true,
      })
      .catch(() => null);

    // enum UserStatus {
    //   online = 'https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png',
    //   idle = 'https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png',
    //   dnd = 'https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png',
    //   offline = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    //   invisible = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    // }

    const e = new MessageEmbed();

    if (m) {
      e.setAuthor({
        name: `${u.tag} - User info`,
        iconURL: avatar(u, 64),
        // iconURL: m.presence ? UserStatus[m.presence.status] : UserStatus.offline,
      });
      e.setDescription(
        (await userBadges(u)).join(' ') +
          '\n' +
          `Profile picture: ${[2048, 512, 256]
            .map((size) => `**[${size}px](${avatar(u, size)})**`)
            .join(' | ')} | \`/user pfp${u.equals(this.user) ? '`' : ` user:${u.id}\``}`
      );
      e.addField('ID', u.id);

      if (m.nickname) e.addField('Server nickname', m.nickname);

      // const acts = activities(m);
      // if (m.presence && acts.length > 0)
      //   if (acts.length === 1) e.addField('Activity', acts.toString(), true);
      //   else e.addField(`Activities (${acts.length})`, `• ${acts.join('\n• ')}`, true);

      // if (m.presence && m.presence.activities.filter((a) => a.type === 'CUSTOM').length > 0)
      //   e.addField('Custom status', `${customStatus(m)}`, true);

      const roles = m.roles.cache.filter((r) => r.id !== this.guild.id);
      e.addField(
        `${roles.size === 1 ? 'Role' : 'Roles'} (${roles.size})`,
        roles.size > 0
          ? roles.map((r) => r.toString()).join(' ')
          : "*This user doesn't have any roles...*"
      );

      e.addField(
        `Global key permissions`,
        m.permissions.has('ADMINISTRATOR', true) || m.permissions.toArray().length === 0
          ? 'Administrator (all permissions)'
          : keyPerms(m.permissions).join(', ')
      );

      e.addField(
        'Joined Discord',
        `<t:${dayjs(u.createdAt).unix()}>\n(<t:${dayjs(u.createdAt).unix()}:R>)`,
        true
      );
      e.setImage(banner(u, 2048));
      e.setThumbnail(avatar(u, 256));
      e.setColor(await getColor(u));
      e.addField(
        'Joined server',
        `<t:${dayjs(m.joinedAt).unix()}>\n(<t:${dayjs(m.joinedAt).unix()}:R>)`,
        true
      );
    } else {
      e.setAuthor({ name: `${u.tag} - User info`, iconURL: avatar(u, 64) });
      e.setDescription(
        (await userBadges(u)).join(' ') +
          '\n' +
          `Profile picture: **[2048px](${avatar(u, 2048)})** | **[512px](${avatar(
            u,
            512
          )})** | **[256px](${avatar(u, 256)})** | \`/user pfp user:${u.id}\``
      );
      e.addField('ID', u.id);
      e.addField(
        'Joined Discord',
        `<t:${dayjs(u.createdAt).unix()}> (<t:${dayjs(u.createdAt).unix()}:R>)`
      );
      e.setImage(banner(u, 2048));
      e.setThumbnail(avatar(u, 256));
      e.setColor(await getColor(u));
    }

    await this.reply({
      embeds: [e],
    });
  },
});

async function userBadges(user: User) {
  const e = emojis.badges;
  const badges = [];
  const flags = (await user.fetchFlags()).toArray();
  for (const flag of flags) {
    switch (flag) {
      case 'HOUSE_BRILLIANCE':
        badges.push(e.houses.brilliance);
        break;
      case 'HOUSE_BALANCE':
        badges.push(e.houses.balance);
        break;
      case 'HOUSE_BRAVERY':
        badges.push(e.houses.bravery);
        break;
      case 'BUGHUNTER_LEVEL_1':
        badges.push(e.bugHunter1);
        break;
      case 'BUGHUNTER_LEVEL_2':
        badges.push(e.bugHunter1);
        break;
      case 'EARLY_SUPPORTER':
        badges.push(e.earlySupporter);
        break;
      case 'HYPESQUAD_EVENTS':
        badges.push(e.hypesquad);
        break;
      case 'DISCORD_EMPLOYEE':
        badges.push(e.discordStaff);
        break;
      case 'PARTNERED_SERVER_OWNER':
        badges.push(e.partner);
        break;
      case 'EARLY_VERIFIED_BOT_DEVELOPER':
        badges.push(e.developer);
        break;
      case 'VERIFIED_BOT':
        badges.push(e.verifiedBot);
        break;
      case 'DISCORD_CERTIFIED_MODERATOR':
        badges.push('certified mod (no emoji for now)');
        break;
    }
  }
  return badges;
}
