import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { ModerationStrikeTypes } from '@prisma/client';
import { dateToSnowflake } from '@purplet/utils';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  GuildTextBasedChannel,
  Message,
  MessageButton,
  MessageEmbedOptions,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ModalComponent,
  SelectMenuComponent,
  UserContextCommand,
  components,
  row,
} from 'purplet';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import {
  ModerationAction,
  checkModerationPermission,
  handleModerationAction,
  moderationVerbStrings,
} from './_base';

export default UserContextCommand({
  name: 'Report User',
  async handle(user) {
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

    await this.showModal(
      new ReportModal(user.id).setTitle(`Report ${formatUsername(user)}`).setComponents(
        row(
          new TextInputComponent({
            customId: 'description',
            label: t(this, 'DESCRIPTION'),
            placeholder: t(this, 'MODREPORTS_MODAL_DESCRIPTION_PLACEHOLDER'),
            style: 'PARAGRAPH',
            maxLength: 1024,
            minLength: 10,
            required: true,
            type: 'TEXT_INPUT',
          }),
        ),
      ),
    );
  },
});

export const ReportModal = ModalComponent({
  async handle(userId: string) {
    const description = this.fields.getTextInputValue('description');
    const user = await this.client.users.fetch(userId);

    await this.deferReply({
      ephemeral: true,
    });

    const entry = await prisma.moderationEntry.create({
      data: {
        id: dateToSnowflake(new Date()),
        userId: this.user.id,
        guildId: this.guildId,
        targetId: userId,
        type: ModerationAction.UserReport,
        reason: description,
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

    const { modReportsChannelId } = await getGuildSettings(this.guildId);
    const reportsChannel = this.guild.channels.cache.get(
      modReportsChannelId,
    ) as GuildTextBasedChannel;

    try {
      await reportsChannel.send({
        embeds: [reportEmbed],
        components: components(
          row(
            new ActionSelectMenu({ userId, reportId: entry.id })
              .setPlaceholder(t(this.guildLocale, 'MODREPORTS_SELECT_MENU'))
              .setOptions([
                {
                  label: t(this.guildLocale, 'WARN_USER'),
                  value: ModerationStrikeTypes.WARN,
                  emoji: emojis.colors.yellow,
                },
                {
                  label: t(this.guildLocale, 'KICK_USER'),
                  value: ModerationStrikeTypes.KICK,
                  emoji: emojis.colors.orange,
                },
                {
                  label: t(this.guildLocale, 'BAN_USER'),
                  value: ModerationStrikeTypes.BAN,
                  emoji: emojis.colors.red,
                },
              ]),
          ),
          row(
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

export const DismissReportBtn = ButtonComponent({
  async handle({ reportId }) {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)) {
      return CRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS', {
          permissions: t(this, 'PERMISSION_ADMINISTRATOR'),
        }),
      );
    }

    await prisma.moderationEntry.delete({
      where: { id: reportId },
    });

    await fetchWithCache(
      `strikes:${this.guildId}`,
      () =>
        prisma.moderationEntry.findMany({
          where: { guildId: this.guild.id },
        }),
      true,
    );

    await this.update({
      components: components(
        row(
          new MessageButton({
            customId: 'lol',
            style: 'SECONDARY',
            disabled: true,
            label: `Report deleted by ${formatUsername(this.user)}`,
          }),
        ),
      ),
    });
  },
});

export const ActionSelectMenu = SelectMenuComponent({
  async handle({ userId, reportId }) {
    const user = await this.client.users.fetch(userId);
    const type = Number(this.values[0]) as ModerationAction;

    const { error } = checkModerationPermission.call(this, user, type);

    if (error) {
      return this.reply(error);
    }

    await prisma.moderationEntry.delete({
      where: { id: reportId },
    });

    await (this.message as Message).edit({
      components: components(
        row(
          new MessageButton()
            .setCustomId('who_reads_this')
            .setLabel(
              `User was ${t(
                this.guildLocale,
                `MOD_VERB_${moderationVerbStrings[type]}` as any,
              )} by ${formatUsername(this.user)}`,
            )
            .setStyle('SECONDARY')
            .setDisabled(),
        ),
      ),
    });

    return await handleModerationAction.call(this, {
      type,
      guild: this.guild,
      target: user,
      user: this.user,
      reason: this.message.embeds[0].fields[0].value,
    });
  },
});
