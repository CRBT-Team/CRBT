import { emojis, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { capitalCase } from 'change-case';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import {
  CategoryChannel,
  GuildChannel,
  MessageEmbed,
  TextChannel,
  ThreadAutoArchiveDuration,
  ThreadChannel,
  VoiceChannel,
} from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

dayjs.extend(duration);

export default ChatCommand({
  name: 'channel info',
  description: 'Gives info on a given channel.',
  options: new OptionBuilder().channel(
    'channel',
    'The channel to get info from. Leave blank to get the current one.'
  ),
  async handle({ channel: Channel }) {
    if (!this.guild) {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }

    const channel = (Channel ?? this.channel) as GuildChannel;
    const channels = this.guild.channels;
    const categories = channels.cache.filter((c) => c.type === 'GUILD_CATEGORY');

    const e = new MessageEmbed()
      .setAuthor({ name: `${channel.name} - Channel info` })
      .addField('ID', channel.id)
      .addField(
        'Created at',
        `<t:${dayjs(channel.createdAt).unix()}> (<t:${dayjs(channel.createdAt).unix()}:R>)`
      )
      .setColor(await getColor(this.user));

    if (channel instanceof CategoryChannel) {
      e.setAuthor({
        name: `${channel.name} - Category info`,
        iconURL: icons.channels.category,
      }).addField('Position', `${channel.rawPosition + 1} of ${categories.size} categories`);
    } else if (!(channel instanceof ThreadChannel)) {
      e.addField(
        'Position',
        `${channel.rawPosition}/${channels.channelCountWithoutThreads} (counting categories)`,
        true
      ).addField('Parent category', `${emojis.channels.category} ${channel.parent.name}`, true);
    }

    if (channel.isText()) {
      e.setDescription(channel.topic || '').addField(
        'Content safety',
        channel.nsfw ? 'Age-restricted' : 'Safe',
        true
      );
    }

    if (channel.isVoice()) {
      e.addField(
        'Region Override',
        channel.rtcRegion ? capitalCase(channel.rtcRegion) : 'Automatic',
        true
      )
        .addField(
          'Users in Voice',
          channel.userLimit
            ? `${channel.members.size}/${channel.userLimit} users`
            : `${channel.members.size} (No user limit)`,
          true
        )
        .addField('Bitrate', `${channel.bitrate / 1000}kbps`, true);
    }
    if (channel.type === 'GUILD_NEWS') e.author.iconURL = icons.channels.news;
    if (channel.id === this.guild.rulesChannelId) e.author.iconURL = icons.channels.rules;

    if (channel instanceof TextChannel) {
      e.author.iconURL = channel.nsfw ? icons.channels.nsfw : icons.channels.text;
      e.addField(
        'Slowmode',
        channel.rateLimitPerUser ? `${channel.rateLimitPerUser} seconds` : 'Off',
        true
      );
      if (channel.threads.cache.size > 0) {
        e.addField(
          `Threads (${channel.threads.cache.size})`,
          channel.threads.cache
            .map((t) => `${t} (${threadDuration(t.autoArchiveDuration)})`)
            .join(', ')
        );
      }
    }

    if (channel instanceof VoiceChannel) {
      e.author.iconURL = icons.channels.voice;
      e.addField('Video Quality', channel.videoQualityMode === 'FULL' ? '720p' : 'Auto', true);
    }

    if (channel instanceof ThreadChannel) {
      const autoArchives = dayjs(channel.createdAt).add(channel.autoArchiveDuration, 'm').unix();
      e.setAuthor({ name: `${channel.name} - Thread info`, iconURL: icons.channels.text_thread })
        .addField('Archives', `<t:${autoArchives}> (<t:${autoArchives}:R>)`)
        .addField('Parent channel', `<#${channel.parentId}>`);
    }

    await this.reply({
      embeds: [e],
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
