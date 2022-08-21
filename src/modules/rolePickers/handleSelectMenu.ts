import { colors, icons } from '$lib/db';
import { CooldownError, CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { GuildMember, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { usersOnCooldown } from './rolePickers';

export async function handleRolePickerSelectMenu(this: SelectMenuInteraction) {
  if (
    usersOnCooldown.has(`${this.guild.id}/${this.user.id}`) &&
    usersOnCooldown.get(`${this.guild.id}/${this.user.id}`) > Date.now()
  ) {
    return this.reply(
      await CooldownError(
        this,
        await usersOnCooldown.get(`${this.guild.id}/${this.user.id}`),
        false
      )
    );
  }
  usersOnCooldown.set(this.user.id, Date.now() + 3000);

  const { strings, errors } = t(this, 'role-selectors');
  const roleArray = (this.message.components[0].components[0] as MessageSelectMenu).options.map(
    (role) => JSON.parse(role.value)
  );
  const member = this.member as GuildMember;
  const added = [];
  const removed = [];
  const nope = [];

  const chosen = this.values.map((role) => JSON.parse(role));
  roleArray.forEach((role) => {
    if (!this.guild.roles.cache.get(role.id)) {
      nope.push(role.name);
    }
    if (!chosen.some((r) => r.id === role.id) && member.roles.cache.has(role.id)) {
      member.roles.remove(role.id);
      removed.push(role.name);
    }
    if (chosen.some((r) => r.id === role.id) && !member.roles.cache.has(role.id)) {
      member.roles.add(role.id);
      added.push(role.name);
    }
  });

  // console.log(added, removed, nope);
  // console.log(chosen);
  if (nope.length > 0) {
    return this.reply(CRBTError(errors.ROLES_DO_NOT_EXIST));
  }
  if ((this.component as MessageSelectMenu).maxValues !== 1) {
    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: strings.SELECT_MENU_ROLES_SUCCESS,
            iconURL: icons.success,
          })
          .setDescription(
            added.length > 0 || removed.length > 0
              ? `\`\`\`diff\n${added.length > 0 ? `+ ${added.join(', ')}\n` : ''}${
                  removed.length > 0 ? `- ${removed.join(', ')}\n` : ''
                }\n\`\`\``
              : ''
          )
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });
  } else {
    const role = chosen[0];

    if (role && !member.roles.cache.has(role.id)) {
      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${strings.BUTTON_ROLES_ADD.replace('<ROLE>', role.name)} ${
                role.behavior === 'toggle' ? strings.BUTTON_ROLES_ADD_AGAIN : ''
              }`,
              iconURL: icons.success,
            })
            .setColor(`#${colors.success}`),
        ],
        ephemeral: true,
      });
    } else {
      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.SELECT_MENU_ROLES_SUCCESS,
              iconURL: icons.success,
            })
            .setColor(`#${colors.success}`),
        ],
        ephemeral: true,
      });
    }
  }
}
