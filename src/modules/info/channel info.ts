import { icons } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { snowflakeToDate, timestampMention } from '@purplet/utils';
import { capitalCase } from 'change-case-all';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import {
  APIChannel,
  APIDMChannel,
  APIGroupDMChannel,
  APIGuildForumChannel,
  APIThreadChannel,
  ChannelType,
  Routes,
  SortOrderType,
  VideoQualityMode,
} from 'discord-api-types/v10';
import { EmbedFieldData, TextChannel, ThreadAutoArchiveDuration } from 'discord.js';
import { ChatCommand, getRestClient, OptionBuilder } from 'purplet';

dayjs.extend(duration);

export default ChatCommand({
  name: 'channel info',
  description: 'Gives info on a given channel.',
  allowInDMs: false,
  options: new OptionBuilder().channel(
    'channel',
    'The channel to get info from. Leave blank to get the current one.'
  ),
  async handle() {
    const c = this.options.getChannel('channel') || this.channel;
    const channel = (await getRestClient()
      .get(Routes.channel(c.id))
      .catch(() => c)) as Exclude<APIChannel, APIDMChannel | APIGroupDMChannel>;
    const channels = this.guild.channels;
    const categories = channels.cache.filter((c) => c.type === 'GUILD_CATEGORY');
    const created = snowflakeToDate(channel.id);

    let icon: string;
    let title = 'Channel info';

    const fields: EmbedFieldData[] = [
      {
        name: t(this, 'ID'),
        value: channel.id,
      },
      {
        name: t(this, 'CREATED_ON'),
        value: `${timestampMention(created)} • ${timestampMention(created, 'R')}`,
      },
    ];

    // Check if it's a category
    if (channel.type === ChannelType.GuildCategory) {
      icon = icons.channels.category;
      title = 'Category info';

      fields.push({
        name: 'Position',
        value: `${channel.position + 1} of ${categories.size} categories`,
      });
    }
    // Check if it's a thread or post
    if (
      'thread_metadata' in channel
      // channel.type === ChannelType.PublicThread ||
      // channel.type === ChannelType.AnnouncementThread ||
      // channel.type === ChannelType.PrivateThread
    ) {
      const parent = channels.cache.find((c) => c.id === channel.parent_id) as
        | TextChannel
        | APIGuildForumChannel;

      icon = icons.channels.text_thread;
      title = parent ? 'Thread info' : 'Post info';

      const autoArchives = new Date(
        created.getTime() + (channel.thread_metadata.auto_archive_duration || 0) * 60 * 1000
      );

      fields.push(
        {
          name: 'Parent channel',
          value: `<#${channel.parent_id}>`,
          inline: true,
        },
        {
          name: 'Auto archives on',
          value: `${timestampMention(autoArchives)} • ${timestampMention(autoArchives, 'R')}`,
        }
      );
    }
    // Check if it's a text-like channel
    if (channel.type === ChannelType.GuildText) {
      icon =
        channel.id === this.guild.rulesChannelId
          ? icons.channels.rules
          : channel.nsfw
          ? icons.channels.nsfw
          : icons.channels.text;
    }

    // Check if it's a voice-like channels (stage, voice)
    if ('bitrate' in channel) {
      icon = String(channel.type) === 'GUILD_VOICE' ? icons.channels.voice : icons.channels.stage;

      fields.push(
        {
          name: 'Region Override',
          value: channel.rtc_region ? capitalCase(channel.rtc_region) : 'Automatic',
          inline: true,
        },
        {
          name: 'User limit',
          value: channel.user_limit ? `${channel.user_limit} users` : `*No limit*`,
          inline: true,
        },
        {
          name: 'Bitrate',
          value: `${channel.bitrate / 1000}kbps`,
          inline: true,
        },
        ...(channel.type === ChannelType.GuildVoice
          ? [
              {
                name: 'Video Quality',
                value: channel.video_quality_mode === VideoQualityMode.Full ? '720p' : 'Auto',
                inline: true,
              },
            ]
          : [])
      );
    }
    // Check if it's an announcement channel
    if (channel.type === ChannelType.GuildAnnouncement) {
      icon = icons.channels.announcement;
    }
    // Check if it has slowmode
    if ('rate_limit_per_user' in channel) {
      fields.push({
        name: 'Slowmode',
        value: channel.rate_limit_per_user ? `${channel.rate_limit_per_user} seconds` : 'Off',
        inline: true,
      });
    }
    // Check if it has threads/posts
    if ('default_auto_archive_duration' in channel || 'defaultAutoArchiveDuration' in channel) {
      const threads = (await getRestClient().get(
        Routes.channelThreads(channel.id, 'public')
      )) as APIThreadChannel[];

      fields.push({
        name: `${channel.type === ChannelType.GuildForum ? 'Posts' : 'Threads'} (${
          threads.length
        })`,
        value: threads
          .map((t) => `${t} (${threadDuration(t.thread_metadata.auto_archive_duration)})`)
          .join(', '),
      });
    }
    // Check if it's a forum
    if (channel.type === ChannelType.GuildForum) {
      icon = icons.channels.forum;

      fields.push(
        {
          name: 'Tags',
          value:
            channel.available_tags
              .map(
                (tag) =>
                  `${tag.emoji_id ? `<:a:${tag.emoji_id}>` : tag.emoji_name ?? ''} ${tag.name}`
              )
              .join(', ') || '*None*',
        },
        {
          name: 'Default sort order',
          value:
            channel.default_sort_order === SortOrderType.CreationDate
              ? 'Creation date'
              : 'Latest activity',
          inline: true,
        }
      );
    }

    fields.push({
      name: 'Age-Restricted',
      value: channel.nsfw ? 'Yes' : 'No',
      inline: true,
    });

    await this.reply({
      embeds: [
        {
          author: {
            name: `${channel.name} - ${title}`,
            icon_url: icon,
          },
          description: 'topic' in channel ? channel?.topic : '',
          fields,
          color: await getColor(this.user),
        },
      ],
    });
  },
});

function threadDuration(tDuration: ThreadAutoArchiveDuration) {
  switch (tDuration) {
    case 60:
      return '1 Hour';
    case 1440:
      return '24 Hours';
    case 4320:
      return '3 Days';
    case 10080:
      return '1 Week';
  }
}
