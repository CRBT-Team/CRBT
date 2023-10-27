import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { avatar } from '$lib/functions/avatar';
import { budgetify } from '$lib/functions/budgetify';
import { slashCmd } from '$lib/functions/commandMention';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import { dateToSnowflake } from '@purplet/utils';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildTextBasedChannel, Message, MessageEmbedOptions } from 'discord.js';
import { ButtonComponent, MessageContextCommand, components, row } from 'purplet';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { ActionSelectMenu, DismissReportBtn } from './Report_User';
import { ModerationAction, checkModerationPermission } from './_base';

const messageCache = new Map<string, Message>();

export default MessageContextCommand({
  name: 'Report Message',
  async handle(message) {
    const user = message.author;
    const { modules, modReportsChannelId } = await getGuildSettings(this.guildId);

    if (!modules?.moderationReports && !modReportsChannelId) {
      return CRBTError(this, {
        title: t(this, 'ERROR_MODULE_DISABLED_TITLE'),
        description: t(
          this,
          hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)
            ? 'ERROR_MODULE_DISABLED_DESCRIPTION_ADMIN'
            : `ERROR_MODULE_DISABLED_DESCRIPTION_REGULAR`,
          {
            command: slashCmd('server settings'),
          },
        ),
      });
    }

    const { error } = checkModerationPermission.call(this, user, ModerationAction.UserReport, {
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

    const entry = await prisma.moderationEntry.create({
      data: {
        id: dateToSnowflake(new Date()),
        userId: this.user.id,
        guildId: this.guildId,
        targetId: user.id,
        type: ModerationAction.UserReport,
        reason: description,
        details: JSON.stringify(details),
      },
    });

    const reportEmbed: MessageEmbedOptions = {
      author: {
        name: t(this.guildLocale, 'MODREPORTS_EMBED_TITLE', {
          target: formatUsername(user),
          user: formatUsername(this.user),
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
      modReportsChannelId,
    ) as GuildTextBasedChannel;

    try {
      await reportsChannel.send({
        embeds: [
          reportEmbed,
          ...renderLowBudgetMessage(
            {
              details,
              channel: this.channel,
              guild: this.guild,
              author: user,
            },
            this.guildLocale,
          ),
        ],
        components: components(
          row(
            new ActionSelectMenu({ reportId: entry.id, userId: user.id })
              .setPlaceholder('Choose an action to take.')
              .setOptions([
                {
                  label: t(this.guildLocale, 'WARN_USER'),
                  value: ModerationAction.UserWarn.toString(),
                  emoji: emojis.colors.yellow,
                },
                {
                  label: t(this.guildLocale, 'KICK_USER'),
                  value: ModerationAction.UserKick.toString(),
                  emoji: emojis.colors.orange,
                },
                {
                  label: t(this.guildLocale, 'BAN_USER'),
                  value: ModerationAction.UserBan.toString(),
                  emoji: emojis.colors.red,
                },
              ]),
          ),
          row(
            new DeleteMsgBtn(message.id)
              .setStyle('PRIMARY')
              .setLabel(t(this.guildLocale, 'DELETE_MESSAGE'))
              .setEmoji(emojis.buttons.trash_bin),
            new DismissReportBtn({ reportId: entry.id })
              .setStyle('SECONDARY')
              .setLabel('Delete Report')
              .setEmoji(emojis.buttons.trash_bin),
          ),
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

export const DeleteMsgBtn = ButtonComponent({
  async handle(messageId: string) {
    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageMessages)) {
      return CRBTError(this, 'I need the "Manage Messages" permission to delete this message!');
    }

    const message = messageCache.get(messageId);

    await message.delete();

    await this.reply({
      embeds: [
        {
          title: `${emojis.success} Message successfully deleted.`,
          color: colors.success,
        },
      ],
    });
  },
});
