import { emojis, icons } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { getColor } from '$lib/functions/getColor';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
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
  ThreadAutoArchiveDuration,
  VideoQualityMode,
} from 'discord-api-types/v10';
import { EmbedFieldData, TextChannel } from 'discord.js';
import { ChatCommand, getRestClient, OptionBuilder } from 'purplet';
import { getSettings } from '../settings/serverSettings/_helpers';

dayjs.extend(duration);

export default ChatCommand({
  name: 'channel info',
  nameLocalizations: getAllLanguages('CHANNEL', localeLower),
  description: t('en-US', 'channel_info.description'),
  descriptionLocalizations: getAllLanguages('channel_info.description'),
  allowInDMs: false,
  options: new OptionBuilder().channel(
    'channel',
    t('en-US', 'channel_info.options.channel.description'),
    {
      nameLocalizations: getAllLanguages('CHANNEL', localeLower),
      descriptionLocalizations: getAllLanguages('channel_info.options.channel.description'),
    }
  ),
  async handle() {
    const c = this.options.getChannel('channel') || this.channel;
    const channel = (await getRestClient()
      .get(Routes.channel(c.id))
      .catch(() => c)) as Exclude<APIChannel, APIDMChannel | APIGroupDMChannel>;
    const channels = this.guild.channels;
    const categories = channels.cache.filter((c) => c.type === 'GUILD_CATEGORY');
    const created = snowflakeToDate(channel.id);

    let authorIcon: string;
    let title = t(this, 'CHANNEL');

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
      authorIcon = icons.channels.category;
      title = t(this, 'CATEGORY');

      fields.push({
        name: t(this, 'POSITION'),
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

      authorIcon = icons.channels.text_thread;
      title = parent ? t(this, 'THREAD_CHANNEL') : t(this, 'FORUM_POST');

      const autoArchives = new Date(
        created.getTime() + (channel.thread_metadata.auto_archive_duration || 0) * 60 * 1000
      );

      fields.push(
        {
          name: t(this, 'PARENT_CHANNEL'),
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
      authorIcon =
        channel.id === this.guild.rulesChannelId
          ? icons.channels.rules
          : channel.nsfw
          ? icons.channels.nsfw
          : icons.channels.text;
    }

    // Check if it's a voice-like channels (stage, voice)
    if ('bitrate' in channel) {
      authorIcon =
        String(channel.type) === 'GUILD_VOICE' ? icons.channels.voice : icons.channels.stage;

      fields.push(
        {
          name: 'Region Override',
          value: channel.rtc_region ? capitalCase(channel.rtc_region) : t(this, 'AUTO'),
          inline: true,
        },
        {
          name: 'User limit',
          value: channel.user_limit ? `${channel.user_limit} users` : `*${t(this, 'NONE')}*`,
          inline: true,
        },
        {
          name: t(this, 'BITRATE'),
          value: `${channel.bitrate / 1000}kbps`,
          inline: true,
        }
      );
    }

    if ('video_quality_mode' in channel) {
      fields.push({
        name: t(this, 'VIDEO_QUALITY'),
        value: channel.video_quality_mode === VideoQualityMode.Full ? '720p' : t(this, 'AUTO'),
        inline: true,
      });
    }

    // Check if it's an announcement channel
    if (channel.type === ChannelType.GuildAnnouncement) {
      authorIcon = icons.channels.announcement;
    }
    // Check if it has slowmode
    if ('rate_limit_per_user' in channel) {
      fields.push({
        name: t(this, 'SLOWMODE'),
        value: channel.rate_limit_per_user ? `${channel.rate_limit_per_user} seconds` : 'Off',
        inline: true,
      });
    }
    // Check if it has threads/posts
    if ('default_auto_archive_duration' in channel || 'defaultAutoArchiveDuration' in channel) {
      const threads = (await getRestClient().get(
        Routes.channelThreads(channel.id, 'public')
      )) as APIThreadChannel[];

      const threadDuration: Record<ThreadAutoArchiveDuration, string> = {
        60: '1 hour',
        1440: '24 hours',
        4320: '3 days',
        10080: '1 week',
      };

      fields.push({
        name: `${t(
          this,
          channel.type === ChannelType.GuildForum ? 'FORUM_POSTS' : 'THREAD_CHANNELS'
        )} (${threads.length})`,
        value: threads
          .map((t) => `${t} (${threadDuration[t.thread_metadata.auto_archive_duration]})`)
          .join(', '),
      });
    }
    // Check if it's a forum
    if (channel.type === ChannelType.GuildForum) {
      authorIcon = icons.channels.forum;

      fields.push(
        {
          name: t(this, 'TAGS'),
          value:
            channel.available_tags
              .map(
                (tag) =>
                  `${tag.emoji_id ? `<:a:${tag.emoji_id}>` : tag.emoji_name ?? ''} ${tag.name}`
              )
              .join(', ') || `*${t(this, 'NONE')}*`,
        },
        {
          name: 'Default sort order',
          value:
            channel.default_sort_order === SortOrderType.CreationDate
              ? 'Date posted'
              : 'Recently Active',
          inline: true,
        }
      );
    }

    await this.reply({
      embeds: [
        {
          author: {
            name: `${channel.name} - ${title}`,
            icon_url: authorIcon,
          },
          description:
            `${
              channel.nsfw
                ? icon((await getSettings(this.guildId)).accentColor, 'toggleon')
                : emojis.toggle.off
            } ${t(this, 'AGE_RESTRICTED')}\n` +
            ('topic' in channel && channel.topic
              ? channel.topic.length > 512
                ? `${channel.topic.slice(0, 512)}...`
                : channel.topic
              : ''),
          fields,
          color: await getColor(this.user),
        },
      ],
    });
  },
});
