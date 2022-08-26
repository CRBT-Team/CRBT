import { cache } from '$lib/cache';
import { db, emojis, items } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { keyPerms } from '$lib/functions/keyPerms';
import { time } from '$lib/functions/time';
import { t } from '$lib/language';
import { TimeoutTypes } from '$lib/types/timeouts';
import { invisibleChar } from '$lib/util/invisibleChar';
import dayjs from 'dayjs';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  GuildMember,
  Interaction,
  MessageEmbed,
  TextInputComponent,
  User,
  UserContextMenuInteraction,
  UserFlags,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  OptionBuilder,
  row,
  UserContextCommand,
} from 'purplet';
import { findNextBirthday, ReminderBirthdayBtn } from '../../components/RemindButton';
import { timeouts } from '../../events/ready';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from './_navbar';

export default ChatCommand({
  name: 'user info',
  description: "Get a user's Discord information.",
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to get yours.'),
  async handle({ user }) {
    const u = await (user ?? this.user).fetch();
    const m = (user ? this.options.getMember('user') : this.member) as GuildMember;

    // enum UserStatus {
    //   online = 'https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png',
    //   idle = 'https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png',
    //   dnd = 'https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png',
    //   offline = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    //   invisible = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    // }

    await this.reply(
      await renderUser(
        this,
        u,
        {
          targetId: u.id,
          userId: this.user.id,
        },
        m
      )
    );
  },
});

export const ctxCommand = UserContextCommand({
  name: 'Get User Info',
  async handle(user) {
    const member = (this as UserContextMenuInteraction).targetMember as GuildMember;

    await this.reply({
      ...(await renderUser(
        this,
        user,
        {
          targetId: user.id,
          userId: this.user.id,
        },
        member
      )),
      ephemeral: true,
    });
  },
});

export function getBadgeEmojis(flags: UserFlags, additionalBadges?: string[]) {
  const { badges } = emojis;
  return [
    ...(additionalBadges ? additionalBadges.map((b) => items.badges[b].contents) : []),
    ...flags.toArray()?.map((flag) => {
      switch (flag) {
        case 'VERIFIED_BOT':
          return badges.verifiedBot;
        case 'DISCORD_EMPLOYEE':
          return badges.discordStaff;
        case 'PARTNERED_SERVER_OWNER':
          return badges.partner;
        case 'DISCORD_CERTIFIED_MODERATOR':
          return badges.cerifiedMod;
        case 'HYPESQUAD_EVENTS':
          return badges.hypesquad;
        case 'HOUSE_BRILLIANCE':
          return badges.houses.brilliance;
        case 'HOUSE_BALANCE':
          return badges.houses.balance;
        case 'HOUSE_BRAVERY':
          return badges.houses.bravery;
        case 'BUGHUNTER_LEVEL_1':
          return badges.bugHunter1;
        case 'BUGHUNTER_LEVEL_2':
          return badges.bugHunter1;
        case 'EARLY_SUPPORTER':
          return badges.earlySupporter;
        case 'EARLY_VERIFIED_BOT_DEVELOPER':
          return badges.developer;
      }
    }),
  ].filter(Boolean);
}

export async function renderUser(
  ctx: Interaction,
  user: User,
  navCtx: NavBarContext,
  member?: GuildMember
) {
  const crbtUser = await db.users.findFirst({
    where: { id: user.id },
    select: { crbtBadges: true, achievements: true, birthday: true },
  });

  const birthdayReminder = timeouts.find(
    ({ id, type, data }) =>
      type === TimeoutTypes.Reminder &&
      id === `${user.id}/${ctx.user.id}-BIRTHDAY` &&
      data.userId === ctx.user.id
  );

  const userBadges = getBadgeEmojis(user.flags, crbtUser?.crbtBadges);
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  const e = new MessageEmbed()
    .setAuthor({
      name: t(ctx.locale, 'USER_INFO_EMBED_TITLE').replace('<USER>', user.tag),
      iconURL: avatar(member ?? user, 64),
    })
    .setDescription(userBadges.length > 0 ? `${userBadges.join('‎ ')}${invisibleChar}` : '')
    .addField('ID', user.id)
    .setImage(banner(user, size ?? 2048, format))
    .setThumbnail(avatar(member ?? user, size ?? 256, format))
    .setColor(await getColor(user));

  if (crbtUser?.birthday) {
    const nextBday = findNextBirthday(crbtUser.birthday);

    e.addField('Birthday', `${time(crbtUser.birthday, 'D')} • ${time(nextBday, 'R')}`);
  }

  if (member) {
    const roles = member.roles.cache.filter((r) => r.id !== ctx.guild.id);

    if (member.nickname) e.addField(t(ctx.locale, 'USER_INFO_NICKNAME'), member.nickname);

    e.addField(
      `${t(ctx.locale, 'USER_INFO_ROLES')} • ${roles.size}`,
      roles.size > 0
        ? roles.map((r) => r.toString()).join(' ')
        : t(ctx.locale, 'USER_INFO_NO_ROLES')
    )
      .addField(
        t(ctx.locale, 'USER_INFO_PERMS'),
        hasPerms(member, PermissionFlagsBits.Administrator) ||
          member.permissions.toArray().length === 0
          ? 'Administrator (all permissions)'
          : keyPerms(member.permissions).join(', ')
      )
      .addField(
        t(ctx.locale, 'USER_INFO_CREATED_AT'),
        `${time(user.createdAt)}\n${time(user.createdAt, true)}`,
        true
      )
      .addField(
        t(ctx.locale, 'USER_INFO_JOINED_SERVER'),
        `${time(member.joinedAt)}\n${time(member.joinedAt, true)}`,
        true
      );
  } else {
    e.addField(
      t(ctx.locale, 'USER_INFO_CREATED_AT'),
      `${time(user.createdAt)} • ${time(user.createdAt, true)}`
    );
  }
  return {
    embeds: [e],
    components: components(
      navBar(navCtx, ctx.locale, 'userinfo', getTabs('userinfo', user, member)),
      ...(ctx.user.id !== user.id && !crbtUser?.birthday
        ? []
        : [
            row(
              ctx.user.id === user.id
                ? new EditCRBTInfoBtn()
                    .setLabel(t(ctx.locale, 'EDIT_CRBT_PROFILE_BUTTON'))
                    .setEmoji(emojis.buttons.pencil)
                    .setStyle('PRIMARY')
                : crbtUser?.birthday
                ? new ReminderBirthdayBtn({
                    targetId: user.id,
                    bday: findNextBirthday(crbtUser.birthday).toISOString(),
                  })
                    .setLabel(
                      !!birthdayReminder
                        ? t(ctx, 'remind me').strings.SUCCESS_TITLE
                        : t(ctx, 'BIRTHDAY_REMINDER_BUTTON')
                    )
                    .setEmoji(emojis.reminder)
                    .setStyle('PRIMARY')
                    .setDisabled(!!birthdayReminder)
                : null
            ),
          ])
    ),
  };
}

export const EditCRBTInfoBtn = ButtonComponent({
  async handle() {
    if (this.user.id !== this.message.interaction.user.id) {
      return this.reply(CRBTError(t(this, 'user_navbar').errors.NOT_CMD_USER));
    }

    const user = await db.users.findFirst({
      where: { id: this.user.id },
      select: { accentColor: true, birthday: true },
    });

    await this.showModal(
      new EditCRBTInfoModal().setTitle('Edit CRBT Profile').setComponents(
        row(
          new TextInputComponent()
            .setCustomId('accent_color')
            .setLabel(t(this, 'CRBT_ACCENT_COLOR'))
            .setValue(user.accentColor)
            .setMaxLength(7)
            .setMinLength(6)
            // .setPlaceholder(t(this, 'EDIT_PROFILE_MODAL_COLOR_PLACEHOLDER'))
            .setStyle('SHORT')
        ),
        row(
          new TextInputComponent()
            .setCustomId('birthday')
            .setLabel(t(this, 'USER_INFO_BIRTHDAY'))
            .setStyle('SHORT')
            .setPlaceholder('YYYY-MM-DD')
            .setValue(user?.birthday?.toISOString()?.split('T')[0] ?? '')
            .setMinLength(10)
            .setMaxLength(10)
        )
      )
    );
  },
});

export const EditCRBTInfoModal = ModalComponent({
  async handle(ctx: null) {
    let color = this.fields.getTextInputValue('accent_color').toLowerCase().replace('#', '');
    const bday = dayjs(this.fields.getTextInputValue('birthday').trim() + 'T12:00:00');

    if (!/[0-9a-f]{6}/.test(color) && color !== 'profile') {
      return this.reply(CRBTError(t(this, 'ERROR_INVALID_HEX')));
    }

    color = color === 'profile' ? color : `#${color}`;

    cache.set(`${this.user.id}:color`, color);

    if (!bday.isValid() || !bday.isBefore(new Date())) {
      return this.reply(CRBTError(t(this, 'ERROR_INVALID_BIRTHDAY')));
    }

    await db.users.upsert({
      where: { id: this.user.id },
      update: {
        accentColor: color,
        birthday: bday.toDate(),
      },
      create: {
        accentColor: color,
        birthday: bday.toDate(),
        id: this.user.id,
      },
    });

    const c = await getColor(this.user);

    console.log(c);

    this.update({
      embeds: [
        new MessageEmbed(this.message.embeds[0]).setColor(c).setFields(
          this.message.embeds[0].fields.map((f) => {
            if (f.name === t(this, 'USER_INFO_BIRTHDAY')) {
              const nextBday = findNextBirthday(bday.toDate());
              return {
                name: f.name,
                value: `${time(bday, 'D')} • ${time(nextBday, 'R')}`,
              };
            }
            return f;
          })
        ),
      ],
    });
  },
});
