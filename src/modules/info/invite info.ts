import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import { APIInvite, GuildNSFWLevel, Routes } from 'discord-api-types/v10';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, getRestClient, OptionBuilder } from 'purplet';
export default ChatCommand({
  name: 'invite info',
  description: 'Get information on a given Discord invite URL or code.',
  options: new OptionBuilder().string('invite', 'A discord.gg invite URL, or just its code.', {
    required: true,
  }),
  async handle({ invite }) {
    const inviteCode =
      invite.match(/discord\.gg\/(.*)/)?.[1] ??
      invite.match(/discord\.com\/invite\/(.*)/)?.[1] ??
      invite;

    const req = (await getRestClient()
      .get(Routes.invite(inviteCode))
      .catch(async (r) => {
        await this.reply(
          CRBTError(
            "Invalid invite code or URL. Make sure it hasn't expired and anyone has access to it."
          )
        );
      })) as APIInvite;

    const { code, expires_at, guild, channel, inviter } = req;

    const e = new MessageEmbed()
      .setAuthor({
        name: `${code} - Invite Info`,
        iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png',
      })
      .setTitle(guild.name)
      .setDescription(guild.description ?? '')
      .addField('ID', guild.id)
      .addField('Landing channel', `#${channel.name} (${channel.id})`, true)
      .addField(
        'Inviter',
        inviter ? `${inviter.username}#${inviter.discriminator} (${inviter.id})` : `Vanity URL`,
        true
      )
      .addField('Content Warning', GuildNSFWLevel[guild.nsfw_level], true)
      .setImage(
        guild.banner
          ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png`
          : guild.splash
          ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png`
          : null
      )
      .setThumbnail(
        guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null
      )
      .setColor(await getColor(this.user));

    if (expires_at) {
      const date = dayjs(expires_at).unix();
      e.addField('Expires', `<t:${date}>\n(<t:${date}:R>)`, true);
    }

    if (this.client.guilds.cache.has(guild.id)) {
      e.addField('More info', `\`/server info id:${guild.id}\``);
    }

    this.reply({
      embeds: [e],
    });
  },
});
