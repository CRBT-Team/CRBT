import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { ModerationStrikeTypes } from '@prisma/client';
import { PermissionFlagsBits, TextInputStyle } from 'discord-api-types/v10';
import { GuildTextBasedChannel, Message, MessageButton, MessageEmbedOptions } from 'discord.js';
import { ButtonComponent, components, ModalComponent, row, UserContextCommand } from 'purplet';
import { getSettings } from '../settings/serverSettings/_helpers';
import { checkModerationPermission, handleModerationAction } from './_base';

export default UserContextCommand({
  name: 'Report User',
  async handle(user) {
    const { modules, modReportsChannel } = await getSettings(this.guildId);

    if (!modules?.moderationReports && !modReportsChannel) {
      return CRBTError(this, {
        title: 'This module is not enabled on the server!',
        description: hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)
          ? `You may enable it using ${slashCmd('settings')}.`
          : `You can ask an admin of the server to enable it using ${slashCmd('settings')}.`,
      });
    }

    const { error } = checkModerationPermission.call(this, user, ModerationStrikeTypes.REPORT, {
      checkHierarchy: false,
    });

    if (error) {
      return this.reply(error);
    }

    await this.showModal(
      new ReportModal(user.id).setTitle(`Report ${user.tag}`).setComponents(
        row({
          custom_id: 'description',
          label: `Report description`,
          placeholder: 'Describe your report and add details to go with it.',
          style: TextInputStyle.Paragraph,
          max_length: 1024,
          min_length: 10,
          required: true,
          type: 'TEXT_INPUT',
        })
      )
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

    await prisma.moderationStrikes.create({
      data: {
        createdAt: new Date(),
        moderatorId: this.user.id,
        serverId: this.guildId,
        targetId: userId,
        type: ModerationStrikeTypes.REPORT,
        reason: description,
      },
    });

    const reportEmbed: MessageEmbedOptions = {
      author: {
        name: `${user.tag} was reported by ${this.user.tag}`,
        icon_url: avatar(user),
      },
      fields: [
        {
          name: t(this, 'DESCRIPTION'),
          value: description,
        },
        {
          name: t(this, 'REPORTED_BY'),
          value: `${this.user}`,
          inline: true,
        },
        {
          name: t(this, 'USER'),
          value: `${user}`,
          inline: true,
        },
      ],
      color: await getColor(this.guild),
    };

    const { modReportsChannel } = await getSettings(this.guildId);
    const reportsChannel = this.guild.channels.cache.get(
      modReportsChannel
    ) as GuildTextBasedChannel;

    try {
      await reportsChannel.send({
        embeds: [reportEmbed],
        components: components(
          row(
            new ActionButton({ userId: user.id, type: ModerationStrikeTypes.WARN })
              .setStyle('PRIMARY')
              .setLabel('Warn User'),
            new ActionButton({ userId: user.id, type: ModerationStrikeTypes.KICK })
              .setStyle('DANGER')
              .setLabel('Kick User'),
            new ActionButton({ userId: user.id, type: ModerationStrikeTypes.BAN })
              .setStyle('DANGER')
              .setLabel('Ban User')
          )
        ),
      });

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} Your report was successfully sent to ${this.guild.name}'s moderators.`,
            description: `This report was added to ${user}'s moderation history. People with access to the chosen Moderation Reports channel will be able to read your report, which looks like this:`,
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

export const ActionButton = ButtonComponent({
  async handle({ userId, type }: { userId: string; type: ModerationStrikeTypes }) {
    const user = await this.client.users.fetch(userId);

    await (this.message as Message).edit({
      components: components(
        row(
          new MessageButton()
            .setLabel(`User was ${t(this.guildLocale, `MOD_VERB_${type}`)} by ${this.user.tag}`)
            .setStyle('SECONDARY')
            .setDisabled()
        )
      ),
    });

    return await handleModerationAction.call(this, {
      type,
      guild: this.guild,
      target: user,
      moderator: this.user,
      reason: this.message.embeds[0].fields[0].value,
    });
  },
});
