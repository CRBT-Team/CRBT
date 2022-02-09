import { GuildMember } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components as Components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';

export default ChatCommand({
  name: 'roles_picker create',
  description: 'Creates a roles picker UI.',
  options: new OptionBuilder()
    .role('role1', 'The role to use for the roles picker.', true)
    .role('role2', 'A second role to use for the roles picker.', true)
    .role('role3', 'A third role to use for the roles picker.')
    .role('role4', 'A fourth role to use for the roles picker.')
    .role('role5', 'A fifth role to use for the roles picker.')
    .role('role6', 'A sixth role to use for the roles picker.')
    .role('role7', 'A seventh role to use for the roles picker.')
    .role('role8', 'A eighth role to use for the roles picker.')
    .role('role9', 'A ninth role to use for the roles picker.')
    .role('role10', 'A tenth role to use for the roles picker.'),
  async handle(roles) {
    await this.deferReply({
      ephemeral: true,
    });
    const rolesList = Object.values(roles);
    console.log(rolesList);

    const components = Components(
      row(
        rolesList.length === 2
          ? (new RoleButton(rolesList[0].id).setLabel(rolesList[0].name).setStyle('PRIMARY'),
            new RoleButton(rolesList[1].id).setLabel(rolesList[1].name).setStyle('PRIMARY'))
          : new RoleSelector()
      )
    );
    await this.channel.send({
      content: 'Select a role',
      components,
    });
  },
});

export const RoleButton = ButtonComponent({
  handle(role: string) {
    (this.member as GuildMember).roles.add(role);
    this.reply({ content: `You've chosen ${role}`, ephemeral: true });
  },
});

export const RoleSelector = SelectMenuComponent({
  handle(role) {
    // const role = roles[this.selected];
    // (this.member as GuildMember).roles.add(role);
    // this.reply({ content: `You've chosen ${role}`, ephemeral: true });
  },
});
