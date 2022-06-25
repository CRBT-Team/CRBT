import { colors, db, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'welcome channel',
  description: t('en-US', 'JOINLEAVE_CHANNEL_DESCRIPTION').replace(
    '<TYPE>',
    t('en-US', 'JOIN_MESSAGE').toLowerCase()
  ),
  options: new OptionBuilder().channel(
    'channel',
    t('en-US', 'JOINLEAVE_CHANNEL_OPTION_CHANNEL_DESCRIPTION').replace(
      '<TYPE>',
      t('en-US', 'JOIN_MESSAGE').toLowerCase()
    ),
    {
      channelTypes: [ChannelType.GuildText],
      required: true,
    }
  ),
  async handle({ channel }) {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
      return this.reply(CRBTError(t(this, 'ERROR_ADMIN_ONLY')));
    }
    if (
      !(channel as TextChannel)
        .permissionsFor(this.guild.me)
        .has([PermissionFlagsBits.SendMessages])
    ) {
      return this.reply(CRBTError('I do not have permission to send messages in this channel.'));
    }

    await this.deferReply({ ephemeral: true });

    await db.servers.upsert({
      where: { id: this.guildId },
      create: { id: this.guildId, joinChannel: channel.id },
      update: { joinChannel: channel.id },
    });
    await db.serverModules.upsert({
      where: { id: this.guildId },
      create: { id: this.guildId, joinMessage: true },
      update: { joinMessage: true },
    });

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this, 'JOINLEAVE_CHANNEL_SUCCESS_TITLE').replace(
              '<TYPE>',
              t('en-US', 'JOIN_CHANNEL')
            ),
            iconURL: icons.success,
          })
          .setDescription(
            t(this, 'JOIN_CHANNEL_SUCCESS_DESCRIPTION').replace('<CHANNEL>', channel.toString())
          )
          .setColor(`#${colors.success}`),
      ],
    });
  },
});
