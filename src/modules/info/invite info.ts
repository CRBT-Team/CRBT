import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';
export default ChatCommand({
  name: 'invite info',
  description: 'Get information on a given Discord invite URL or code.',
  options: new OptionBuilder().string('invite', 'A discord.gg invite URL, or just its code.', true),
  async handle({ invite }) {
    const inviteCode =
      invite.match(/discord\.gg\/(.*)/)?.[1] ??
      invite.match(/discord\.com\/invite\/(.*)/)?.[1] ??
      invite;

    const req = await fetch(`https://discord.com/api/invites/${inviteCode}`);

    if (!req.ok) {
      this.reply(
        CRBTError(
          "Invalid invite code or URL. Make sure it hasn't expired and anyone has access to it."
        )
      );
    }

    const { code, expires_at, guild, channel, inviter } = (await req.json()) as any;

    const e = new MessageEmbed()
      .setAuthor({
        name: `${code} - Invite Info`,
        iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png',
      })
      .setTitle(guild.name)

      .addField('Landing channel', `#${channel.name} (${channel.id})`, true)
      .addField('Server ID', guild.id, true)
      .addField(
        'Inviter',
        inviter ? `${inviter.username}#${inviter.discriminator} (${inviter.id})` : `Vanity URL`,
        true
      )
      .setImage(
        !guild.nsfw
          ? guild.banner
            ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png`
            : guild.splash
            ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png`
            : null
          : null
      )
      .setThumbnail(
        !guild.nsfw
          ? guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : null
          : null
      )
      .setColor(await getColor(this.user));

    if (guild.features.includes('COMMUNITY')) {
      e.setDescription(
        !guild.nsfw
          ? guild.description ?? guild.welcome_screen
            ? guild.welcome_screen.description
            : null
          : `Because this server is marked as NSFW, its description, banner and icon are hidden.`
      );
    }
    if (this.client.guilds.cache.has(guild.id)) {
      e.addField('More info', `\`/server info id:${guild.id}\``, true);
    }
    if (expires_at) {
      const date = dayjs(expires_at).unix();
      e.addField('Expires', `<t:${date}>\n(<t:${date}:R>)`, true);
    }

    this.reply({
      embeds: [e],
    });
  },
});
