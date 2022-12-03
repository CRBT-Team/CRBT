import { colors } from '$lib/env';
import { keyPerms } from '$lib/functions/keyPerms';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import canvas from 'canvas';
import { MessageAttachment } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'role info',
  description: 'Get information about a specified server role.',
  allowInDMs: false,
  options: new OptionBuilder().role('role', 'The role whose info to get.', { required: true }),
  async handle({ role }) {
    const img = canvas.createCanvas(256, 256);
    const ctx = img.getContext('2d');
    ctx.fillStyle = role.hexColor;
    ctx.fillRect(0, 0, img.width, img.height);

    await this.reply({
      embeds: [
        {
          author: {
            name: `${role.name} - Role info`,
          },
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
              name: 'Color',
              value: role.color === 0 ? t(this, 'NONE') : role.hexColor,
              inline: true,
            },
            {
              name: 'Position',
              value:
                (role.position === 0 ? '-' : `${this.guild.roles.cache.size - role.rawPosition}`) +
                ` out of ${this.guild.roles.cache.size - 1} roles`,
              inline: true,
            },
            {
              name: t(this, 'ADDED'),
              value: `${timestampMention(role.createdAt)} • ${timestampMention(
                role.createdAt,
                'R'
              )}`,
            },
            {
              name: 'Hoisted',
              value: t(this, role.hoist ? 'YES' : 'NO'),
              inline: true,
            },
            {
              name: 'Mentionable',
              value: t(this, role.mentionable ? 'YES' : 'NO'),
              inline: true,
            },
            {
              name: 'Managed',
              value: role.managed
                ? role.tags.premiumSubscriberRole
                  ? `Subscriber role`
                  : `By <@!${role.tags.botId ?? role.tags.integrationId}>`
                : ' No',
              inline: true,
            },
            {
              name: t(this, 'MAJOR_PERMS'),
              value:
                role.permissions.has('ADMINISTRATOR', true) ||
                role.permissions.toArray().length === 0
                  ? 'Administrator (all permissions)'
                  : keyPerms(role.permissions).join(', '),
            },
          ],
          thumbnail: {
            url: 'attachment://role.png',
          },
          color: role.color === 0 ? colors.blurple : role.color,
        },
      ],
      files: role.color === 0 ? [] : [new MessageAttachment(img.toBuffer(), 'role.png')],
    });
  },
});
