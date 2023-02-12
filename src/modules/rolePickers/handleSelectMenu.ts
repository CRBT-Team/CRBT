import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { GuildMember, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';

export async function handleRolePickerSelectMenu(this: SelectMenuInteraction) {
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
    return CRBTError(this, errors.ROLES_DO_NOT_EXIST);
  }
  if ((this.component as MessageSelectMenu).maxValues !== 1) {
    this.reply({
      embeds: [
        {
          title: `${emojis.success} ${strings.SELECT_MENU_ROLES_SUCCESS}.`,
          color: colors.success,
          description:
            added.length > 0 || removed.length > 0
              ? `\`\`\`diff\n${added.length > 0 ? `+ ${added.join(', ')}\n` : ''}${
                  removed.length > 0 ? `- ${removed.join(', ')}\n` : ''
                }\n\`\`\``
              : '',
        },
      ],
      ephemeral: true,
    });
  } else {
    const role = chosen[0];

    if (role && !member.roles.cache.has(role.id)) {
      this.reply({
        embeds: [
          {
            title: `${emojis.success} ${strings.BUTTON_ROLES_ADD.replace('{ROLE}', role.name)} ${
              role.behavior === 'toggle' ? strings.BUTTON_ROLES_ADD_AGAIN : ''
            }`,
            color: colors.success,
          },
        ],
        ephemeral: true,
      });
    } else {
      this.reply({
        embeds: [
          {
            title: `${emojis.success} ${strings.SELECT_MENU_ROLES_SUCCESS}.`,
            color: colors.success,
          },
        ],
        ephemeral: true,
      });
    }
  }
}
