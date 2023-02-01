import { colors, emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { ButtonInteraction, GuildMember } from 'discord.js';

export async function handleRolePickerButton(
  this: ButtonInteraction,
  data: { id: string; behavior: string }
) {
  const role = await this.guild.roles.fetch(data.id);

  const { strings, errors } = t(this, 'role-selectors');

  if (!this.guild.roles.cache.has(data.id)) {
    return CRBTError(this, errors.ROLES_DO_NOT_EXIST);
  }

  const member = this.member as GuildMember;

  if (data.behavior === 'once' && member.roles.cache.has(data.id)) {
    return CRBTError(this, errors.BUTTON_ROLES_ONCE);
  }

  if (!member.roles.cache.has(data.id)) {
    member.roles.add(data.id);
    this.reply({
      embeds: [
        {
          title: `${emojis.success} ${strings.BUTTON_ROLES_ADD.replace('{ROLE}', role.name)} ${
            data.behavior === 'toggle' ? strings.BUTTON_ROLES_ADD_AGAIN : ''
          }.`,
          color: colors.success,
        },
      ],
      ephemeral: true,
    });
  } else {
    member.roles.remove(data.id);
    this.reply({
      embeds: [
        {
          title: `${emojis.success} ${strings.BUTTON_ROLES_REMOVE.replace('{ROLE}', role.name)} ${
            data.behavior === 'toggle' ? strings.BUTTON_ROLES_REMOVE_AGAIN : ''
          }.`,
          color: colors.success,
        },
      ],
      ephemeral: true,
    });
  }
}
