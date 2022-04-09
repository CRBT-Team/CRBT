import { colors, emojis, illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { languages } from '$lib/language';
import { GuildMember, MessageEmbed, MessageSelectMenu, Role } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';

const { colorNames } = languages['en-US']['color set'];
const { pronouns } = languages['en-US'].profile;
const { preset, manual } = languages['en-US']['role-selectors'];

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
    ].map(([name, emoji]) => ({ name, emoji, color: '#9266CC' })),
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
  ...preset.meta,
  options: new OptionBuilder().enum(
    'preset',
    preset.meta.options[0].description,
    Object.keys(presets).map((key) => ({ name: preset.presets[key].name, value: key })),
    true
  ),
  async handle(opts) {
    if (!(this.member as GuildMember).permissions.has('ADMINISTRATOR', true)) {
      return this.reply(CRBTError('Only server administrators can create Role Selectors.'));
    }

    if (!this.guild.me.permissions.has('MANAGE_ROLES')) {
      return this.reply(
        CRBTError('I need the "Manage Roles" permission in order to create a Role Selector.')
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    const preset = presets[opts.preset];
    const { strings } = languages[this.guildLocale]['role-selectors'];
    const presetStrings = languages[this.guildLocale]['role-selectors'].preset.presets[opts.preset];

    const rolesList = [];
    preset.roles.forEach(async (role) => {
      const find = this.guild.roles.cache.find((r) => r.name === role.name);
      if (find) {
        return rolesList.push({
          label: role.label,
          name: find.name,
          id: find.id,
          emoji: role.emoji,
        });
      } else {
        this.guild.roles
          .create({
            color: role.color,
            name: role.name,
            reason: `New Role Selector`,
          })
          .then((r) => {
            return rolesList.push({
              label: role.label,
              name: r.name,
              id: r.id,
              emoji: role.emoji,
            });
          });
      }
    });
    const limit = preset.limit || rolesList.length;

    await this.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: strings.EMBED_TITLE })
          .setDescription(
            `${presetStrings.message ?? strings.GENERIC_SELECTOR_TITLE}\n\n${rolesList
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
                      description: strings.OPTION_LABEL_GET_ROLE.replace('<ROLE>', role.name),
                      value: JSON.stringify({ name: role.name, id: role.id }),
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
            iconURL: illustrations.success,
          })
          .setDescription(strings.SUCCESS_DESCRIPTION),
      ],
    });
  },
});

export const useManual = ChatCommand({
  ...manual.meta,
  options: new OptionBuilder()
    .string('description', manual.meta.options[0].description, true)
    .enum(
      'behavior',
      manual.meta.options[1].description,
      [
        {
          name: manual.meta.options[1].choices[0],
          value: 'toggle',
        },
        {
          name: manual.meta.options[1].choices[1],
          value: 'once',
        },
      ],
      true
    )
    .integer('role_limit', manual.meta.options[2].description, true)
    .role(`role1`, manual.meta.options[3].description, true)
    .role(`role2`, manual.meta.options[3].description)
    .role(`role3`, manual.meta.options[3].description)
    .role(`role4`, manual.meta.options[3].description)
    .role(`role5`, manual.meta.options[3].description)
    .role(`role6`, manual.meta.options[3].description)
    .role(`role7`, manual.meta.options[3].description)
    .role(`role8`, manual.meta.options[3].description)
    .role(`role9`, manual.meta.options[3].description)
    .role(`role10`, manual.meta.options[3].description),
  async handle({ description, behavior, role_limit, ...roles }) {
    if (!(this.member as GuildMember).permissions.has('ADMINISTRATOR', true)) {
      return this.reply(CRBTError('Only server administrators can create Role Selectors.'));
    }

    if (!this.guild.me.permissions.has('MANAGE_ROLES')) {
      return this.reply(
        CRBTError('I need the "Manage Roles" permission in order to create a Role Selector.')
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    const rolesList: Role[] = Object.values(roles);
    const limit = role_limit || rolesList.length;

    const { strings } = languages[this.guildLocale]['role-selectors'];

    await this.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: strings.EMBED_TITLE })
          .setDescription(
            `${description}\n\n${rolesList.map((role) => role.toString()).join('\n')}`
          )
          .setFooter({
            text: strings.EMBED_FOOTER,
          })
          .setColor(`#${colors.default}`),
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
                      description: strings.OPTION_LABEL_GET_ROLE.replace('<ROLE>', role.name),
                      value: JSON.stringify({ name: role.name, id: role.id }),
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
            iconURL: illustrations.success,
          })
          .setDescription(strings.SUCCESS_DESCRIPTION),
      ],
    });
  },
});

export const RoleButton = ButtonComponent({
  async handle(role: { name: string; id: string; behavior: 'toggle' | 'once' }) {
    const { strings, errors } = languages[this.locale]['role-selectors'];

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
              name:
                strings.BUTTON_ROLES_ADD.replace('<ROLE>', role.name) +
                (role.behavior === 'toggle' ? strings.BUTTON_ROLES_REMOVE_AGAIN : ''),
              iconURL: illustrations.success,
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
              name:
                strings.BUTTON_ROLES_REMOVE.replace('<ROLE>', role.name) +
                (role.behavior === 'toggle' ? strings.BUTTON_ROLES_ADD_AGAIN : ''),
              iconURL: illustrations.success,
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
    const { strings, errors } = languages[this.locale]['role-selectors'];
    const roleArray = (this.message.components[0].components[0] as MessageSelectMenu).options.map(
      (role) => JSON.parse(role.value)
    );
    const added = [];
    const removed = [];
    const nope = [];

    const chosen = this.values.map((role) => JSON.parse(role));
    roleArray.forEach((role) => {
      if (!this.guild.roles.cache.has(role.id)) {
        nope.push(role.name);
      }
      if (!chosen.some((r) => r.id === role.id)) {
        (this.member as GuildMember).roles.remove(role.id);
        removed.push(role.name);
      }
      if (chosen.some((r) => r.id === role.id)) {
        (this.member as GuildMember).roles.add(role.id);
        added.push(role.name);
      }
    });
    if (nope.length === chosen.length) {
      return this.reply(CRBTError(errors.ROLES_DO_NOT_EXIST));
    }

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: strings.SELECT_MENU_ROLES_SUCCESS,
            iconURL: illustrations.success,
          })
          .setDescription(
            `\`\`\`diff\n+ ${added.join(', ') || 'None'}\n- ${
              removed.join(', ') || 'None'
            }\n\`\`\`` + (nope.length ? errors.ROLES_DO_NOT_EXIST : '')
          )
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });
  },
});
