import { colors, emojis, icons } from '$lib/db';
import { CooldownError, CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { getStrings } from '$lib/language';
import { GuildMember, MessageEmbed, MessageSelectMenu, Role } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';
import { colorsMap } from '../settings/color set';

const { colorNames } = getStrings('en-US', 'color set');
const { pronouns } = getStrings('en-US', 'profile');
const { preset, manual } = getStrings('en-US', 'role-selectors');

const usersOnCooldown = new Map();

const presets: {
  [key: string]: {
    behavior: 'toggle' | 'once';
    limit: number;
    roles: {
      label?: string;
      name: string;
      color?: `#${string}`;
      emoji?: string;
    }[];
  };
} = {
  colors: {
    behavior: 'toggle',
    limit: 1,
    roles: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'].map((c) => ({
      name: colorNames[c],
      color: `#${colors[c]}`,
      emoji: emojis.colors[c],
    })),
  },
  pronouns: {
    behavior: 'toggle',
    limit: 0,
    roles: [pronouns.sh, pronouns.hh, pronouns.tt, pronouns.other, pronouns.ask].map((p) => ({
      name: p,
    })),
  },
  zodiacSigns: {
    behavior: 'toggle',
    limit: 1,
    roles: [
      ['Aries', '♈'],
      ['Taurus', '♉'],
      ['Gemini', '♊'],
      ['Cancer', '♋'],
      ['Leo', '♌'],
      ['Virgo', '♍'],
      ['Libra', '♎'],
      ['Scorpio', '♏'],
      ['Sagittarius', '♐'],
      ['Capricorn', '♑'],
      ['Aquarius', '♒'],
      ['Pisces', '♓'],
    ].map(([name, emoji]) => ({ name, emoji })),
  },
  verification: {
    behavior: 'once',
    limit: 1,
    roles: [
      {
        label: 'Verify',
        name: 'Members',
        emoji: emojis.success,
      },
    ],
  },
};

export const usePreset = ChatCommand({
  name: 'role-picker preset',
  description: preset.meta.description,
  options: new OptionBuilder().string('preset', preset.meta.options[0].description, {
    choices: Object.keys(presets).reduce(
      (acc, key) => ({
        ...acc,
        key: preset.presets[key].name,
      }),
      {}
    ),
    required: true,
  }),
  async handle(opts) {
    const { strings, errors } = getStrings(this.guildLocale, 'role-selectors');

    if (!(this.member as GuildMember).permissions.has('ADMINISTRATOR', true)) {
      return this.reply(CRBTError(errors.USER_MISSING_PERMS));
    }

    if (!this.guild.me.permissions.has('MANAGE_ROLES')) {
      return this.reply(CRBTError(errors.BOT_MISSING_PERMS));
    }

    await this.deferReply({
      ephemeral: true,
    });

    try {
      const preset = presets[opts.preset];
      const presetStrings = getStrings(this.guildLocale, 'role-selectors').preset.presets[
        opts.preset
      ];

      const rolesList = [];

      await Promise.all(
        preset.roles.map(async (role) => {
          const find = this.guild.roles.cache.find((r) => r.name === role.name);
          if (find) {
            return rolesList.push({
              label: role.label,
              name: find.name,
              id: find.id,
              emoji: role.emoji,
            });
          } else {
            const newRole = await this.guild.roles.create({
              color: role.color,
              name: role.name,
              reason: 'Role Picker Preset',
              permissions: 0n,
            });

            return rolesList.push({
              label: role.label,
              name: newRole.name,
              id: newRole.id,
              emoji: role.emoji,
            });
          }
        })
      );

      const limit = preset.limit || rolesList.length;
      await this.channel.send({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: strings.EMBED_TITLE })
            .setTitle(presetStrings.message ?? strings.GENERIC_SELECTOR_TITLE)
            .setDescription(
              rolesList.length <= 5 && limit === 1
                ? ''
                : `${rolesList
                    .map((role) => `${role.emoji ?? ''} <@&${role.id}>`.trim())
                    .join('\n')}`
            )
            .setColor(`#${colors.default}`),
        ],
        components: components(
          rolesList.length <= 5 && limit === 1
            ? row().addComponents(
                rolesList.map(({ name, id, emoji }) => {
                  return new RoleButton({ name, id, behavior: preset.behavior })
                    .setLabel(name)
                    .setStyle('SECONDARY')
                    .setEmoji(emoji);
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
                        label: role.label ?? role.name,
                        value: JSON.stringify({
                          name: role.name,
                          id: role.id,
                          behavior: preset.behavior,
                        }),
                        emoji: role.emoji,
                      };
                    })
                  )
              )
        ),
      });

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.SUCCESS_TITLE,
              iconURL: icons.success,
            })
            .setDescription(strings.SUCCESS_DESCRIPTION)
            .setColor(`#${colors.success}`),
        ],
      });
    } catch (error) {
      await this.editReply(UnknownError(this, error));
    }
  },
});

export const useManual = ChatCommand({
  name: 'role-picker create',
  description: manual.meta.description,
  options: new OptionBuilder()
    .string('description', manual.meta.options[0].description, { required: true })
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
    })
    .string('embed_color', "What color to use for the embed's background", {
      async autocomplete({ embed_color }) {
        return colorsMap
          .filter(
            (colorObj) =>
              !colorObj.private &&
              colorObj.fullName.toLowerCase().includes(embed_color.toLowerCase()) &&
              colorObj.value !== 'profile'
          )
          .map((colorObj) => ({ name: colorObj.fullName, value: colorObj.value }));
      },
      required: true,
    })
    .role(`role1`, manual.meta.options[3].description, { required: true })
    .role(`role2`, manual.meta.options[3].description)
    .role(`role3`, manual.meta.options[3].description)
    .role(`role4`, manual.meta.options[3].description)
    .role(`role5`, manual.meta.options[3].description)
    .role(`role6`, manual.meta.options[3].description)
    .role(`role7`, manual.meta.options[3].description)
    .role(`role8`, manual.meta.options[3].description)
    .role(`role9`, manual.meta.options[3].description)
    .role(`role10`, manual.meta.options[3].description)
    .role(`role11`, manual.meta.options[3].description)
    .role(`role12`, manual.meta.options[3].description)
    .role(`role13`, manual.meta.options[3].description),
  async handle({ description, behavior, role_limit, embed_color, ...roles }) {
    const { strings, errors } = getStrings(this.guildLocale, 'role-selectors');
    const { errors: colorErrors } = getStrings(this.guildLocale, 'color set');

    if (!(this.member as GuildMember).permissions.has('ADMINISTRATOR', true)) {
      return this.reply(CRBTError(errors.USER_MISSING_PERMS));
    }

    if (!this.guild.me.permissions.has('MANAGE_ROLES')) {
      return this.reply(CRBTError(errors.BOT_MISSING_PERMS));
    }

    await this.deferReply({
      ephemeral: true,
    });

    const rolesList: Role[] = Object.values(roles);
    const limit = role_limit || rolesList.length;

    const text = embed_color.toLowerCase().replaceAll(/ |#/g, '');
    const finalColor = colors[text] ? colors[text] : text;

    console.log(finalColor);

    if (!finalColor || !finalColor.match(/^[0-9a-f]{6}$/)) {
      return await this.editReply(CRBTError(colorErrors.INVALID_COLOR_NAME));
    }

    this.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: strings.EMBED_TITLE })
          .setTitle(description)
          .setDescription(
            rolesList.length <= 5 && limit === 1
              ? ''
              : `${rolesList.map((role) => `<@&${role.id}>`.trim()).join('\n')}`
          )
          .setFooter({
            text: strings.EMBED_FOOTER,
          })
          .setColor(`#${finalColor}`),
      ],
      components: components(
        rolesList.length <= 5 && limit === 1
          ? row().addComponents(
              rolesList.map(({ name, id }) => {
                return new RoleButton({ name, id, behavior }).setLabel(name).setStyle('SECONDARY');
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
                      // description: strings.OPTION_LABEL_GET_ROLE.replace('<ROLE>', role.name),
                      value: JSON.stringify({ name: role.name, id: role.id, behavior }),
                    };
                  })
                )
            )
      ),
    });

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: strings.SUCCESS_TITLE,
            iconURL: icons.success,
          })
          .setDescription(strings.SUCCESS_DESCRIPTION)
          .setColor(`#${colors.success}`),
      ],
    });
  },
});

export const RoleButton = ButtonComponent({
  async handle(role: { name: string; id: string; behavior: 'toggle' | 'once' }) {
    if (
      usersOnCooldown.has(`${this.guild.id}/${this.user.id}`) &&
      usersOnCooldown.get(`${this.guild.id}/${this.user.id}`) > Date.now()
    ) {
      return this.reply(
        await CooldownError(this, usersOnCooldown.get(`${this.guild.id}/${this.user.id}`), false)
      );
    }
    usersOnCooldown.set(this.user.id, Date.now() + 3000);

    const { strings, errors } = getStrings(this.locale, 'role-selectors');

    // console.log(this.guild.roles.cache.get(role.id));
    // console.log(role);

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

export const RoleSelector = SelectMenuComponent({
  async handle(ctx: null) {
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

    const { strings, errors } = getStrings(this.locale, 'role-selectors');
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
  },
});
