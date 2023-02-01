// import { CRBTError } from '$lib/functions/CRBTError';
// import { getColor } from '$lib/functions/getColor';
// import { hasPerms } from '$lib/functions/hasPerms';
// import { localeLower } from '$lib/functions/localeLower';
// import { getAllLanguages, t } from '$lib/language';
// import { MessageBuilderTypes } from '$lib/types/messageBuilder';
// import { PermissionFlagsBits } from 'discord-api-types/v10';
// import { Role } from 'discord.js';
// import { ChatCommand, components, OptionBuilder, row } from 'purplet';
// import { MessageBuilder } from '../components/MessageBuilder';
// import SelectMenu from './SelectMenu';

// export const usersOnCooldown = new Map();

// const options = new OptionBuilder()
//   .string('behavior', t('en-US', 'role-selectors.manual.meta.options.0.description' as any), {
//     nameLocalizations: getAllLanguages(
//       'role-selectors.manual.meta.options.0.name' as any,
//       localeLower
//     ),
//     descriptionLocalizations: getAllLanguages(
//       'role-selectors.manual.meta.options.0.description' as any
//     ),
//     choices: {
//       toggle: t('en-US', 'role-selectors.manual.meta.options.0.choices.0' as any),
//       once: t('en-US', 'role-selectors.manual.meta.options.0.choices.1' as any),
//     },
//     required: true,
//   })
//   .integer('role_limit', t('en-US', 'role-selectors.manual.meta.options.1.description' as any), {
//     nameLocalizations: getAllLanguages(
//       'role-selectors.manual.meta.options.1.name' as any,
//       localeLower
//     ),
//     descriptionLocalizations: getAllLanguages(
//       'role-selectors.manual.meta.options.1.description' as any
//     ),
//     minValue: 0,
//     maxValue: 13,
//     required: true,
//   });

// for (let i = 1; i <= 13; i++) {
//   options.role(`role${i}`, t('en-US', 'role-selectors.manual.meta.options.2.description' as any), {
//     nameLocalizations: getAllLanguages('ROLE', (str, locale) => `${localeLower(str, locale)}${i}`),
//     descriptionLocalizations: getAllLanguages(
//       'role-selectors.manual.meta.options.2.description' as any
//     ),
//     required: i === 1,
//   });
// }

// export const useManual = ChatCommand({
//   name: 'role-picker create',
//   description: t('en-US', 'role-selectors.manual.meta.description'),
//   descriptionLocalizations: getAllLanguages('role-selectors.manual.meta.description'),
//   allowInDMs: false,
//   options,
//   async handle({ behavior, role_limit, ...roles }) {
//     const { strings, errors } = t(this.guildLocale, 'role-selectors');

//     if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)) {
//       return CRBTError(this, t(this, 'ERROR_ADMIN_ONLY'));
//     }

//     if (!hasPerms(this.appPermissions, PermissionFlagsBits.ManageRoles)) {
//       return CRBTError(this, errors.BOT_MISSING_PERMS);
//     }

//     await this.deferReply({
//       ephemeral: true,
//     });

//     const rolesList: Role[] = Object.values(roles);
//     const limit = (role_limit > rolesList.length ? 0 : role_limit) || rolesList.length;

//     const builder = MessageBuilder({
//       data: {
//         type: MessageBuilderTypes.rolePicker,
//         embed: {
//           title: strings.GENERIC_SELECTOR_TITLE,
//           color: await getColor(this.guild),
//         },
//         components: components(
//           row(
//             new SelectMenu(null)
//               .setPlaceholder(limit === 1 ? strings.CHOOSE_ROLE : strings.CHOOSE_ROLES)
//               .setMinValues(0)
//               .setMaxValues(limit)
//               .setOptions(
//                 rolesList.map((role) => {
//                   return {
//                     label: role.name,
//                     value: JSON.stringify({ id: role.id, behavior }),
//                   };
//                 })
//               )
//               .setDisabled(true)
//           )
//         ),
//       },
//       interaction: this,
//     });

//     await this.editReply(builder);
//   },
// });
