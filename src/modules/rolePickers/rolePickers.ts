import { colors } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { MessageBuilderTypes } from '$lib/types/messageBuilder';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Role } from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';
import { MessageBuilder } from '../components/MessageBuilder';
import { RoleButton } from './Button';
import { RoleSelector } from './Selector';

const { manual } = t('en-US', 'role-selectors');

export const usersOnCooldown = new Map();

const options = new OptionBuilder()
  .string('behavior', manual.meta.options[1].description, {
    choices: {
      toggle: manual.meta.options[1].choices[0],
      once: manual.meta.options[1].choices[1],
    },
    required: true,
  })
  .integer('role_limit', manual.meta.options[2].description, {
    minValue: 0,
    maxValue: 13,
    required: true,
  });

for (let i = 1; i <= 13; i++) {
  options.role(`role${i}`, manual.meta.options[3].description, { required: i === 1 });
}

export const useManual = ChatCommand({
  name: 'role-picker create',
  description: manual.meta.description,
  allowInDMs: false,
  options,
  async handle({ behavior, role_limit, ...roles }) {
    const { strings, errors } = t(this.guildLocale, 'role-selectors');

    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)) {
      return this.reply(CRBTError(errors.USER_MISSING_PERMS));
    }

    if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageRoles)) {
      return this.reply(CRBTError(errors.BOT_MISSING_PERMS));
    }

    await this.deferReply({
      ephemeral: true,
    });

    const rolesList: Role[] = Object.values(roles);
    const limit = (role_limit > rolesList.length ? 0 : role_limit) || rolesList.length;

    const builder = MessageBuilder({
      data: {
        type: MessageBuilderTypes.rolePicker,
        embed: {
          title: strings.GENERIC_SELECTOR_TITLE,
          color: parseInt(colors.default, 16),
        },
        components: components(
          rolesList.length === 1 || (rolesList.length <= 3 && limit === rolesList.length)
            ? row().addComponents(
                rolesList.map(({ name, id }) => {
                  return new RoleButton({ name, id, behavior })
                    .setLabel(name)
                    .setStyle('SECONDARY')
                    .setDisabled(true);
                })
              )
            : row(
                new RoleSelector()
                  .setPlaceholder(limit === 1 ? strings.CHOOSE_ROLE : strings.CHOOSE_ROLES)
                  .setMinValues(0)
                  .setMaxValues(limit)
                  .setOptions(
                    rolesList.map((role) => {
                      return {
                        label: role.name,
                        value: JSON.stringify({ id: role.id, behavior }),
                      };
                    })
                  )
                  .setDisabled(true)
              )
        ),
      },
      interaction: this,
    });

    await this.editReply(builder);
  },
});
