import { colors, icons } from '$lib/db';
import { CooldownError, CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { usersOnCooldown } from './rolePickers';

export const RoleButton = ButtonComponent({
  async handle(role: { name: string; id: string; behavior: string }) {
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

    if (!this.guild.roles.cache.has(role.id)) {
      return this.reply(CRBTError(errors.ROLE_DOES_NOT_EXIST.replace('<ROLE>', role.name)));
    }

    const member = this.member as GuildMember;

    if (role.behavior === 'once' && member.roles.cache.has(role.id)) {
      return this.reply(CRBTError(errors.BUTTON_ROLES_ONCE));
    }

    if (!member.roles.cache.has(role.id)) {
      member.roles.add(role.id);
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
      member.roles.remove(role.id);
      this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${strings.BUTTON_ROLES_REMOVE.replace('<ROLE>', role.name)} ${
                role.behavior === 'toggle' ? strings.BUTTON_ROLES_REMOVE_AGAIN : ''
              }`,
              iconURL: icons.success,
            })
            .setColor(`#${colors.success}`),
        ],
        ephemeral: true,
      });
    }
  },
});
