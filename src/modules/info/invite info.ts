import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import {
  formatGuildBannerURL,
  formatGuildIconURL,
  formatGuildSplashURL,
  timestampMention,
} from '@purplet/utils';
import { APIInvite, ChannelType, MessageFlags, Routes } from 'discord-api-types/v10';
import { EmbedFieldData } from 'discord.js';
import { ChatCommand, getRestClient, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'invite info',
  nameLocalizations: getAllLanguages('INVITE', localeLower),
  description: t('en-US', 'invite_info.description'),
  descriptionLocalizations: getAllLanguages('invite_info.description'),
  options: new OptionBuilder().string(
    'invite',
    t('en-US', 'invite_info.options.invite.description'),
    {
      nameLocalizations: getAllLanguages('INVITE', localeLower),
      descriptionLocalizations: getAllLanguages('invite_info.options.invite.description'),
      required: true,
    }
  ),
  async handle({ invite }) {
    const inviteCode =
      invite.match(/discord\.gg\/(.*)/)?.[1] ??
      invite.match(/discord\.com\/invite\/(.*)/)?.[1] ??
      invite;

    const res = (await getRestClient()
      .get(Routes.invite(inviteCode))
      .catch(
        async (r) =>
          await CRBTError(this, {
            title: t(this, 'INVITE_INFO_ERROR_INVALID_TITLE'),
            description: t(this, 'INVITE_INFO_ERROR_INVALID_DESCRIPTION'),
          })
      )) as APIInvite;

    const { expires_at, guild, channel, inviter } = res;

    const fields: EmbedFieldData[] = [
      {
        name: t(this, 'ID'),
        value: guild ? guild.id : channel.id,
      },
      {
        name: t(this, 'INVITE_INFO_INVITER'),
        value: inviter
          ? `${formatUsername(inviter)} (${inviter.id})`
          : t(this, 'CUSTOM_INVITE_LINK'),
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

    if (channel.type === ChannelType.GroupDM) {
      return this.reply({
        embeds: [
          {
            title: `${channel.name ?? t(this, 'UNNAMED')} - ${t(this, 'GROUP_DM_INVITE')}`,
            fields,
            thumbnail: {
              url:
                'icon' in channel && channel.icon
                  ? `https://cdn.discordapp.com/channel-icons/${channel.id}/${channel.icon}.png`
                  : 'https://discord.com/assets/3cb840d03313467838d658bbec801fcd.png',
            },
            color: await getColor(this.user),
          },
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    fields.push({
      name: 'Landing channel',
      value: `#${channel.name} (${channel.id})`,
      inline: true,
    });

    if (this.client.guilds.cache.has(guild.id)) {
      fields.push({
        name: 'More info',
        value: `${slashCmd('server info')} \`id:${guild.id}\``,
      });
    }

    await this.reply({
      embeds: [
        {
          title: `${guild.name} - ${t(this, 'SERVER_INVITE')}`,
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
