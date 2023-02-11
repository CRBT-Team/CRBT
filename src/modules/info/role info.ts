import { emojis } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { keyPerms } from '$lib/functions/keyPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { snowflakeToDate, timestampMention } from '@purplet/utils';
import canvas from 'canvas';
import dedent from 'dedent';
import { APIRole, PermissionFlagsBits, Routes } from 'discord-api-types/v10';
import { MessageAttachment } from 'discord.js';
import { ChatCommand, getRestClient, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'role info',
  description: t('en-US', 'role_info.description'),
  descriptionLocalizations: getAllLanguages('role_info.description'),
  allowInDMs: false,
  options: new OptionBuilder().role('role', t('en-US', 'role_info.options.role.description'), {
    nameLocalizations: getAllLanguages('ROLE', localeLower),
    descriptionLocalizations: getAllLanguages('role_info.options.role.description', localeLower),
    required: true,
  }),
  async handle({ role }) {
    const rawRole: APIRole = (
      (await getRestClient().get(Routes.guildRoles(this.guildId))) as APIRole[]
    ).find((r) => r.id === role.id);

    const img = canvas.createCanvas(256, 256);
    if (!role.icon && role.color) {
      const ctx = img.getContext('2d');
      ctx.fillStyle = role.hexColor;
      ctx.fillRect(0, 0, img.width, img.height);
    }

    const perms = keyPerms(role.permissions);

    let managed: string;

    if (rawRole.tags?.premium_subscriber) {
      managed = t(this, 'ROLE_INFO_PREMIUM_SUBSCRIBER');
    } else if (rawRole.tags?.bot_id) {
      managed = t(this, 'ROLE_INFO_MANAGED_BOT', {
        bot: `<@${rawRole.tags.bot_id}>`,
      });
    } else if (rawRole.tags?.integration_id) {
      managed = t(this, 'ROLE_INFO_MANAGED_INTEGRATION');
    }

    await this.reply({
      embeds: [
        {
          title: t(this, 'ROLE_INFO_TITLE', {
            role: role.name,
          }),
          description:
            (managed ? `**${managed}**\n` : '') +
            dedent`
          ${role.mentionable ? icon(role.color, 'toggleon') : emojis.toggle.off} ${t(
              this,
              'ROLE_INFO_MENTIONABLE'
            )}
          ${role.hoist ? icon(role.color, 'toggleon') : emojis.toggle.off} ${t(
              this,
              'ROLE_INFO_HOISTED'
            )}
          `,
          fields: [
            {
              name: t(this, 'ID'),
              value: role.id,
            },
            {
              name: t(this, 'MEMBERS'),
              value: role.members.size.toLocaleString(this.locale),
              inline: true,
            },
            {
              name: t(this, 'COLOR'),
              value: role.color === 0 ? t(this, 'NONE') : role.hexColor,
              inline: true,
            },
            {
              name: t(this, 'POSITION'),
              value: t(this, 'ROLE_INFO_POSITION', {
                position: !role.position
                  ? '-'
                  : (this.guild.roles.cache.size - role.rawPosition).toLocaleString(this.locale),
                roles: (this.guild.roles.cache.size - 1).toLocaleString(this.locale),
              }),
              inline: true,
            },
            {
              name: t(this, 'ADDED'),
              value: `${timestampMention(snowflakeToDate(role.id))} • ${timestampMention(
                snowflakeToDate(role.id),
                'R'
              )}`,
            },
            {
              name: t(this, 'MAJOR_PERMS'),
              value: hasPerms(role.permissions, PermissionFlagsBits.Administrator, true)
                ? t(this, 'ADMIN_ALL_PERMS')
                : perms.length
                ? perms.join(', ')
                : t(this, 'NO_PERMS'),
            },
          ],
          thumbnail: {
            url: role.icon ? role.iconURL() : 'attachment://role.png',
          },
          color: role.color || (await getColor(this.guild)),
        },
      ],
      files: !(role.icon || role.color) ? [] : [new MessageAttachment(img.toBuffer(), 'role.png')],
    });
  },
});
