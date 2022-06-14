import { CRBTError } from '$lib/functions/CRBTError';
import { keyPerms } from '$lib/functions/keyPerms';
import canvas from 'canvas';
import dayjs from 'dayjs';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'role info',
  description: 'Get information about a specified server role.',
  options: new OptionBuilder().role('role', 'The role whose info to get.', { required: true }),
  async handle({ role }) {
    if (!this.guild) {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }

    const img = canvas.createCanvas(512, 512);
    const ctx = img.getContext('2d');
    ctx.fillStyle = role.hexColor;
    ctx.fillRect(0, 0, img.width, img.height);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `${role.name} - Role info` })
          .addField('ID', role.id)
          .addField('Members', `${role.members.size}`, true)
          .addField('Color', role.hexColor.replace('#0000000', 'None'), true)
          .addField(
            'Position',
            (role.position === 0 ? '-' : `${this.guild.roles.cache.size - role.rawPosition}`) +
              ` out of ${this.guild.roles.cache.size - 1} roles`,
            true
          )
          .addField(
            'Added',
            `<t:${dayjs(role.createdAt).unix()}> (<t:${dayjs(role.createdAt).unix()}:R>)`
          )
          .addField('Hoisted', role.hoist ? 'Yes' : ' No', true)
          .addField('Mentionable', role.mentionable ? 'Yes' : ' No', true)
          .addField(
            'Managed',
            role.managed
              ? role.tags.premiumSubscriberRole
                ? `Subscriber role`
                : `By <@!${role.tags.botId ?? role.tags.integrationId}>`
              : ' No',
            true
          )
          .addField(
            'Global major permissions',
            role.permissions.has('ADMINISTRATOR', true) || role.permissions.toArray().length === 0
              ? 'Administrator (all permissions)'
              : keyPerms(role.permissions).join(', ')
          )
          .setThumbnail('attachment://role.png')
          .setColor(role.hexColor !== '#000000' ? role.hexColor : '#B9BBBE'),
      ],
      files: role.hexColor !== '#000000' ? [new MessageAttachment(img.toBuffer(), 'role.png')] : [],
    });
  },
});
