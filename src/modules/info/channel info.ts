import { illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import D, { MessageEmbed, ThreadAutoArchiveDuration } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

dayjs.extend(duration);

export default ChatCommand({
  name: 'channel info',
  description: 'Gives info on a given channel.',
  options: new OptionBuilder().channel(
    'channel',
    'The channel to get info from. Leave blank to get the current one.'
  ),
  async handle({ channel }) {
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }

    const c: D.GuildChannel = (channel ?? (await this.channel.fetch())) as D.GuildChannel;
    const i = illustrations.channels;
    const categories = (await this.guild.fetch()).channels.cache.filter(
      (c) => c.type === 'GUILD_CATEGORY'
    ).size;

    const e = new MessageEmbed().addField('ID', c.id).setColor(await getColor(this.user));

    if (c.type === 'GUILD_TEXT') {
      const info: D.TextChannel = c as D.TextChannel;
      e.setAuthor({
        name: `${info.name} - Channel info`,
        iconURL: c.equals(this.guild.rulesChannel) ? i.rules : i.text,
      });
      if (info.topic) e.setDescription(info.topic);
      if (info.threads.cache.size > 0) {
        e.addField(
          'Threads',
          info.threads.cache
            .map((t) => `${t} (${threadDuration(t.autoArchiveDuration)})`)
            .join(', ')
        );
      }
      e.addField('Parent category', info.parent.name).addField(
        'Slowmode',
        info.rateLimitPerUser ? `${info.rateLimitPerUser} seconds` : 'Off'
      );
    } else if (c.type === 'GUILD_VOICE') {
      const info: D.VoiceChannel = c as D.VoiceChannel;
      e.setAuthor({ name: `${info.name} - Channel info`, iconURL: i.voice })
        .addField('Region', info.rtcRegion ? info.rtcRegion : 'Automatic', true)
        .addField('User limit', info.userLimit ? `${info.userLimit}` : 'Unlimited', true)
        .addField('Bitrate', `${info.bitrate / 1000}kbps`, true)
        .addField('Parent category', info.parent.name);
    } else if (c.type === 'GUILD_CATEGORY') {
      const info: D.CategoryChannel = c as D.CategoryChannel;
      e.setAuthor({ name: `${info.name} - Channel info`, iconURL: i.category }).addField(
        'Position',
        `${info.position} of ${categories} categories`
      );
    } else if (
      (c.type === 'GUILD_PUBLIC_THREAD' ?? c.type === 'GUILD_PRIVATE_THREAD',
      'GUILD_NEWS_THREAD' ?? c.type === 'GUILD_NEWS_THREAD')
    ) {
      const info: D.ThreadChannel = c as unknown as D.ThreadChannel;
      const lm = await info.lastMessage.fetch();
      console.log(lm);
      e.setAuthor({ name: `${c.name} - Thread info` })
        .addField('Archiving', `<t:// calculate the time left, from the createdTimestamp:R>`)
        .addField('Parent channel', info.parent.name);
    } else if (c.type === 'GUILD_NEWS') {
      const info: D.NewsChannel = c as D.NewsChannel;
      e.setAuthor({ name: `${info.name} - Channel info`, iconURL: i.news });
    } else if (c.type === 'GUILD_STAGE_VOICE') {
      const info: D.StageChannel = c as D.StageChannel;
      e.setAuthor({ name: `${info.name} - Channel info` });
    }

    await this.reply({
      embeds: [e],
    });
  },
});

function threadDuration(tDuration: ThreadAutoArchiveDuration) {
  switch (tDuration) {
    case 60:
      return '1 hour';
    case 1440:
      return '1 day';
    case 4320:
      return '3 days';
    case 10080:
      return '1 week';
    case 'MAX':
      return 'Max';
  }
}
