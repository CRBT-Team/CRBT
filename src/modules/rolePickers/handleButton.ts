import { colors, emojis } from '$lib/env';
import { CooldownError, CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { ButtonInteraction, GuildMember } from 'discord.js';
import { usersOnCooldown } from './rolePickers';

export async function handleRolePickerButton(
  this: ButtonInteraction,
  data: { id: string; behavior: string }
) {
  const role = await this.guild.roles.fetch(data.id);

  if (
    usersOnCooldown.has(`${this.guild.id}/${this.user.id}`) &&
    usersOnCooldown.get(`${this.guild.id}/${this.user.id}`) > Date.now()
  ) {
    return this.reply(
      await CooldownError(this, usersOnCooldown.get(`${this.guild.id}/${this.user.id}`), false)
    );
  }
  usersOnCooldown.set(this.user.id, Date.now() + 3000);

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
