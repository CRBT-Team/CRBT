import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import {
  formatDefaultUserAvatarURL,
  formatGuildBannerURL,
  formatGuildIconURL,
  formatGuildSplashURL,
  timestampMention,
} from '@purplet/utils';
import { APIInvite, GuildNSFWLevel, Routes } from 'discord-api-types/v10';
import { EmbedFieldData } from 'discord.js';
import { ChatCommand, getRestClient, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'invite info',
  description: 'Get information on a Discord server invite.',
  options: new OptionBuilder().string('invite', 'A Discord server invite link or code.', {
    required: true,
  }),
  async handle({ invite }) {
    const inviteCode =
      invite.match(/discord\.gg\/(.*)/)?.[1] ??
      invite.match(/discord\.com\/invite\/(.*)/)?.[1] ??
      invite;

    const req = (await getRestClient()
      .get(Routes.invite(inviteCode))
      .catch(
        async (r) =>
          await CRBTError(
            this,
            "Invalid server invite. Make sure that it hasn't expired and that everyone has access to it."
          )
      )) as APIInvite;

    const { code, expires_at, guild, channel, inviter } = req;

    const fields: EmbedFieldData[] = [
      {
        name: t(this, 'ID'),
        value: guild.id,
      },
      {
        name: 'Landing channel',
        value: `#${channel.name} (${channel.id})`,
        inline: true,
      },
      {
        name: 'Invited by',
        value: inviter
          ? `${inviter.username}#${inviter.discriminator} (${inviter.id})`
          : `Custom Invite Link`,
        inline: true,
      },
      {
        name: 'Content Warning',
        value: GuildNSFWLevel[guild.nsfw_level],
        inline: true,
      },
    ];

    if (expires_at) {
      const date = new Date(expires_at);

      fields.push({
        name: t(this, 'EXPIRES_AT'),
        value: `${timestampMention(date)} • ${timestampMention(date, 'R')}`,
        inline: true,
      });
    }

    if (this.client.guilds.cache.has(guild.id)) {
      fields.push({
        name: 'More info',
        value: `\`/server info id:${guild.id}\``,
      });
    }

    await this.reply({
      embeds: [
        {
          author: {
            name: `${code} - Invite info`,
            icon_url: formatDefaultUserAvatarURL(0),
          },
          title: guild.name,
          description: guild.description ?? '',
          image: {
            url: guild.banner
              ? formatGuildBannerURL(guild.id, guild.banner)
              : guild.splash
              ? formatGuildSplashURL(guild.id, guild.splash)
              : null,
          },
          thumbnail: {
            url: guild.icon ? formatGuildIconURL(guild.id, guild.icon) : null,
          },
          color: await getColor(this.user),
          fields,
        },
      ],
    });
  },
});
