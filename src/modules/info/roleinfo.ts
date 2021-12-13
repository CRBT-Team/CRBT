import { keyPerms } from '$lib/functions/keyPerms';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'roleinfo',
  description: 'Gives information about a role.',
  options: new OptionBuilder().role('role', 'The role to give info about.', true),
  async handle({ role }) {
    console.log(
      role.permissions.has('ADMINISTRATOR', true) || role.permissions.toArray().length === 0
        ? 'Administrator (all permissions)'
        : keyPerms(role.permissions).join(', ')
    );
    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor(`${role.name} - Role info`)
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
            'Global key permissions',
            role.permissions.has('ADMINISTRATOR', true) || role.permissions.toArray().length === 0
              ? 'Administrator (all permissions)'
              : keyPerms(role.permissions).join(', ')
          )
          .setColor(role.hexColor !== '#000000' ? role.hexColor : '#B9BBBE'),
      ],
    });
  },
});
