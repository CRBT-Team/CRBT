import { colors, db, icons } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';
import { allCommands } from '../../events/ready';

export default ChatCommand({
  name: 'welcome channel',
  description: t('en-US', 'JOINLEAVE_CHANNEL_DESCRIPTION').replace(
    '<TYPE>',
    t('en-US', 'JOIN_MESSAGE').toLowerCase()
  ),
  allowInDMs: false,
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
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator, true)) {
      return CRBTError(this, t(this, 'ERROR_ADMIN_ONLY'));
    }
    if (
      !hasPerms(
        this.guild.me.permissionsIn(channel as TextChannel),
        PermissionFlagsBits.SendMessages
      )
    ) {
      return CRBTError(this, 'I do not have permission to send messages in this channel.');
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

    const command = allCommands.find((c) => c.name === 'welcome');

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
            t(this, 'JOIN_CHANNEL_SUCCESS_DESCRIPTION')
              .replace('<COMMAND>', slashCmd('welcome message'))

              .replace('<CHANNEL>', channel.toString())
          )
          .setColor(`#${colors.success}`),
      ],
    });
  },
});