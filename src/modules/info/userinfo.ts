import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { customStatus } from '$lib/functions/customStatus';
import { getColor } from '$lib/functions/getColor';
import { keyPerms } from '$lib/functions/keyPerms';
import { activities } from '$lib/functions/userActivities';
import { userBadges } from '$lib/functions/userBadges';
import dayjs from 'dayjs';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'userinfo',
  description: 'Get all info on a Discord user.',
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to get yours.'),
  async handle({ user }) {
    const u = await this.client.users.fetch(user ?? this.user, { force: true });
    const m: GuildMember | null = await (await this.guild.fetch()).members
      .fetch({ user: u, withPresences: true, force: true })
      .catch(() => null);

    enum UserStatus {
      online = 'https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png',
      idle = 'https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png',
      dnd = 'https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png',
      offline = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
      invisible = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    }

    const e = new MessageEmbed();

    if (m) {
      e.setAuthor(
        `${u.tag} - User info`,
        m.presence ? UserStatus[m.presence.status] : UserStatus.offline
      );
      e.setDescription(
        (await userBadges(u)).join(' ') +
          '\n' +
          `Profile picture: ${[2048, 512, 256]
            .map((size) => `**[${size}px](${avatar(u, size)})**`)
            .join(' | ')} | \`/pfp${u.equals(this.user) ? '`' : ` user:${u.id}\``}`
      );
      e.addField('ID', u.id);

      if (m.nickname) e.addField('Display name', m.nickname);

      const acts = activities(m);
      if (m.presence && acts.length > 0)
        if (acts.length === 1) e.addField('Activity', acts.toString(), true);
        else e.addField(`Activities (${acts.length})`, `• ${acts.join('\n• ')}`, true);

      if (m.presence && m.presence.activities.filter((a) => a.type === 'CUSTOM').length > 0)
        e.addField('Custom status', `${customStatus(m)}`, true);

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
        `<t:${dayjs(u.createdAt).unix()}> (<t:${dayjs(u.createdAt).unix()}:R>)`,
        true
      );
      e.setImage(banner(u, 2048));
      e.setThumbnail(avatar(u, 256));
      e.setColor(await getColor(u));
      e.addField(
        'Joined server',
        `<t:${dayjs(m.joinedAt).unix()}> (<t:${dayjs(m.joinedAt).unix()}:R>)`,
        true
      );
    } else {
      e.setAuthor(`${u.tag} - User info`);
      e.setDescription(
        (await userBadges(u)).join(' ') +
          '\n' +
          `Profile picture: **[2048px](${avatar(u, 2048)})** | **[512px](${avatar(
            u,
            512
          )})** | **[256px](${avatar(u, 256)})**`
      );
      e.addField('ID', u.id);
      e.addField('Display name', u.username);
      e.addField('Joined Discord', `<t:${dayjs(u.createdAt).unix()}>`);
      e.setImage(banner(u, 2048));
      e.setThumbnail(avatar(u, 256));
      e.setColor(await getColor(u));
    }

    await this.reply({
      embeds: [e],
    });
  },
});
