import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { budgetify } from '$lib/functions/budgetify';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import { ModerationStrikeTypes } from '@prisma/client';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel, Message, MessageEmbedOptions } from 'discord.js';
import { components, MessageContextCommand, row } from 'purplet';
import { getSettings } from '../settings/serverSettings/_helpers';
import { ActionButton } from './Report_User';
import { checkModerationPermission } from './_base';

const messageCache = new Map<string, Message>();

export default MessageContextCommand({
  name: 'Report Message',
  async handle(message) {
    const user = message.author;
    const { modules, modReportsChannel } = await getSettings(this.guildId);

    if (!modules?.moderationReports && !modReportsChannel) {
      return CRBTError(this, {
        title: t(this, 'ERROR_MODULE_DISABLED_TITLE'),
        description: t(
          this,
          hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)
            ? 'ERROR_MODULE_DISABLED_DESCRIPTION_ADMIN'
            : `ERROR_MODULE_DISABLED_DESCRIPTION_REGULAR`,
          {
            command: slashCmd('settings'),
          }
        ),
      });
    }

    const { error } = checkModerationPermission.call(this, user, ModerationStrikeTypes.REPORT, {
      checkHierarchy: false,
    });

    if (error) {
      return this.reply(error);
    }

    messageCache.set(message.id, message);

    await this.deferReply({
      ephemeral: true,
    });

    const details = budgetify(message);
    const embed = message.embeds.find((e) => e.title || e.description || e.fields[0].name);
    const description = `${(
      message.content ||
      embed?.title ||
      embed?.description ||
      embed?.fields[0].name ||
      ''
    )?.slice(0, 60)}...`;

    await prisma.moderationStrikes.create({
      data: {
        createdAt: new Date(),
        moderatorId: this.user.id,
        serverId: this.guildId,
        targetId: user.id,
        type: ModerationStrikeTypes.REPORT,
        reason: description,
        details: JSON.stringify(details),
      },
    });

    const reportEmbed: MessageEmbedOptions = {
      author: {
        name: t(this.guildLocale, 'MODREPORTS_EMBED_TITLE', {
          target: user.tag,
          user: this.user.tag,
        }),
        icon_url: avatar(user),
      },
      fields: [
        {
          name: t(this.guildLocale, 'DESCRIPTION'),
          value: description,
        },
        {
          name: t(this.guildLocale, 'REPORTED_BY'),
          value: `${this.user}`,
          inline: true,
        },
        {
          name: t(this.guildLocale, 'USER'),
          value: `${user}`,
          inline: true,
        },
      ],
      color: await getColor(this.guild),
    };

    const reportsChannel = this.guild.channels.cache.get(
      modReportsChannel
    ) as GuildTextBasedChannel;

    try {
      await reportsChannel.send({
        embeds: [
          reportEmbed,
          ...renderLowBudgetMessage({
            details,
            channel: this.channel,
            guild: this.guild,
            author: user,
          }),
        ],
        components: components(
          row(
            new ActionButton({ userId: user.id, type: ModerationStrikeTypes.WARN })
              .setStyle('PRIMARY')
              .setLabel(t(this.guildLocale, 'WARN_USER')),
            new ActionButton({ userId: user.id, type: ModerationStrikeTypes.KICK })
              .setStyle('DANGER')
              .setLabel(t(this.guildLocale, 'KICK_USER')),
            new ActionButton({ userId: user.id, type: ModerationStrikeTypes.BAN })
              .setStyle('DANGER')
              .setLabel(t(this.guildLocale, 'BAN_USER'))
          )
        ),
      });

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} ${t(this, 'MODREPORTS_SUCCESS_TITLE', {
              server: this.guild.name,
            })}`,
            description: t(this, 'MODREPORTS_SUCCESS_DESCRIPTION', {
              user: `${user}`,
            }),
            color: colors.success,
          },
          reportEmbed,
        ],
      });
    } catch (e) {
      await this.editReply(UnknownError(this, e));
    }
  },
});
