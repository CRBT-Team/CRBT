import { CRBTError } from '$lib/functions/CRBTError';
import { GuildMember, MessageEmbed, MessageSelectMenu, Role } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components as Components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';

export default ChatCommand({
  name: 'role-selector create',
  description: 'Create a new Role Selector.',
  options: new OptionBuilder()
    .enum(
      'behavior',
      'How the Role Selector should behave.',
      [
        {
          name: 'Give/remove when selected/unselected',
          value: 'e',
        },
        {
          name: 'Only give when selected',
          value: 'g',
        },
        {
          name: 'Only remove when selected',
          value: 'r',
        },
        {
          name: 'Limit selection to one',
          value: 'l',
        },
      ],
      true
    )
    .role('role1', 'A role to give or remove when selected.', true)
    .role('role2', 'A role to give or remove when selected.')
    .role('role3', 'A role to give or remove when selected.')
    .role('role4', 'A role to give or remove when selected.')
    .role('role5', 'A role to give or remove when selected.')
    .role('role6', 'A role to give or remove when selected.')
    .role('role7', 'A role to give or remove when selected.')
    .role('role8', 'A role to give or remove when selected.')
    .role('role9', 'A role to give or remove when selected.')
    .role('role10', 'A role to give or remove when selected.'),
  async handle({ behavior, ...roles }) {
    if (this.user.id !== '327690719085068289') {
      return this.reply(CRBTError('h'));
    }

    await this.deferReply({
      ephemeral: true,
    });
    const rolesList: Role[] = Object.values(roles);

    const components = Components(
      rolesList.length <= 2
        ? row().addComponents(
            rolesList.map(({ name, id }) => {
              return new RoleButton({ name, id }).setLabel(name).setStyle('PRIMARY');
            })
          )
        : row(
            new RoleSelector()
              .setPlaceholder('Choose roles')
              .setMinValues(0)
              .setMaxValues(rolesList.length)
              .setOptions(
                rolesList.map((role) => {
                  return {
                    label: role.name,
                    description: `Get the ${role.name} role.`,
                    value: JSON.stringify({ name: role.name, id: role.id }),
                  };
                })
              )
          )
    );
    await this.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: `Pick a role` })
          .setDescription(rolesList.map((role) => role.toString()).join('\n')),
      ],
      content: 'Select a role',
      components,
    });
  },
});

export const RoleButton = ButtonComponent({
  async handle(role: { name: string; id: string }) {
    if (!(this.member as GuildMember).roles.cache.has(role.id)) {
      (this.member as GuildMember).roles.add(role.id);
      this.reply({ content: `You've chosen ${role.name}!`, ephemeral: true });
    } else {
      (this.member as GuildMember).roles.remove(role.id);
      this.reply({ content: `You've removed ${role.name}!`, ephemeral: true });
    }
  },
});

export const RoleSelector = SelectMenuComponent({
  async handle(ctx: null) {
    const roleArray = (this.message.components[0].components[0] as MessageSelectMenu).options.map(
      (role) => JSON.parse(role.value)
    );
    const chosen = this.values.map((role) => JSON.parse(role));
    roleArray.forEach((role) => {
      if (!chosen.some((r) => r.id === role.id)) {
        (this.member as GuildMember).roles.remove(role.id);
      }
      if (chosen.some((r) => r.id === role.id)) {
        (this.member as GuildMember).roles.add(role.id);
      }
    });

    this.reply({
      content:
        chosen.length > 0
          ? `You've chosen the following roles:\n${chosen.map(({ name }) => name).join('\n')}`
          : `You've removed all roles!`,
      ephemeral: true,
    });
  },
});
