import { emojis } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { keyPerms } from '$lib/functions/keyPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import canvas from '@napi-rs/canvas';
import { snowflakeToDate, timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { APIRole, MessageFlags, PermissionFlagsBits, Routes } from 'discord-api-types/v10';
import { MessageAttachment } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, row } from 'purplet';
import { ShareResponseBtn } from '../components/ShareResult';

export default ChatCommand({
  name: 'role info',
  nameLocalizations: getAllLanguages('ROLE', localeLower),
  description: t('en-US', 'role_info.description'),
  descriptionLocalizations: getAllLanguages('role_info.description'),
  allowInDMs: false,
  options: new OptionBuilder().role('role', t('en-US', 'role_info.options.role.description'), {
    nameLocalizations: getAllLanguages('ROLE', localeLower),
    descriptionLocalizations: getAllLanguages('role_info.options.role.description'),
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
          ${role.mentionable ? emojis.toggle.on : emojis.toggle.off} ${t(
              this,
              'ROLE_INFO_MENTIONABLE'
            )}
          ${role.hoist ? emojis.toggle.on : emojis.toggle.off} ${t(this, 'ROLE_INFO_HOISTED')}
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
                ? t(this, 'PERMISSION_ADMINISTRATOR')
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
      flags: MessageFlags.Ephemeral,
      components: components(row(ShareResponseBtn(this, false))),
      files: !(role.icon || role.color)
        ? []
        : [new MessageAttachment(img.toBuffer('image/png'), 'role.png')],
    });
  },
});
