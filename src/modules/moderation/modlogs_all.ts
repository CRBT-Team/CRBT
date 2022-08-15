import { cache } from '$lib/cache';
import { db, emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { unix } from '$lib/functions/unix';
import { t } from '$lib/language';
import { moderationStrikes } from '@prisma/client';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Interaction, MessageButton, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';

export default ChatCommand({
  name: 'modlogs all',
  description: 'View the moderation history for all users and channels in this server.',
  allowInDMs: false,
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ModerateMembers)) {
      return this.reply(
        CRBTError(t(this, 'ERROR_MISSING_PERMISSIONS').replace('<PERMISSIONS>', 'Moderate Members'))
      );
    }

    const strikes = await db.moderationStrikes.findMany({
      where: { serverId: this.guild.id },
      orderBy: { createdAt: 'desc' },
    });
    cache.set(`strikes:${this.guildId}`, strikes, 60 * 1000 * 15);

    await this.reply(await renderModlogs.call(this, 0));
  },
});

// async function renderModlog(this: Interaction, index: number) {}

async function renderModlogs(this: Interaction, index: number) {
  const data =
    cache.get<moderationStrikes[]>(`strikes:${this.guildId}`) ??
    (await db.moderationStrikes.findMany({
      where: { serverId: this.guild.id },
    }));

  const page = data.slice(index * 10, (index + 1) * 10);
  const pages = Math.ceil(data.length / 10);

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: t(this, 'MODERATION_LOGS_VIEW_TITLE').replace('<SERVER>', this.guild.name),
          iconURL: this.guild.iconURL(),
        })
        .setFields(
          page.map((strike) => {
            if (strike.type === 'CLEAR') {
              return {
                name: `${t(this.guildLocale, `MODERATION_LOGS_CLEAR`)} - ${unix(
                  strike.createdAt,
                  true
                )}`,
                value: `In <#${strike.targetId}>, moderated by <@${strike.moderatorId}>`,
              };
            } else {
              return {
                name: `${t(this.guildLocale, `MODERATION_LOGS_ACTION_${strike.type}`)} ${
                  strike.expiresAt ? `(Expires ${unix(strike.expiresAt, true)})` : ''
                }- ${unix(strike.createdAt, true)}`,
                value: `${strike.reason ?? '*No reason specified*'}\n<@${
                  strike.targetId
                }>, moderated by <@${strike.moderatorId}>`,
              };
            }
          })
        )
        .setColor(await getColor(this.guild)),
    ],
    components: components(
      row(
        new PreviousButton(index - 1)
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('PRIMARY')
          .setDisabled(index === 0),
        new MessageButton()
          .setCustomId('current_page')
          .setLabel(`Page ${index + 1}/${pages}`)
          .setStyle('SECONDARY')
          .setDisabled(true),
        new NextButton(index + 1)
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle('PRIMARY')
          .setDisabled(index === pages - 1)
      )
    ),
  };
}

export const NextButton = ButtonComponent({
  async handle(index: number) {
    await this.update(await renderModlogs.call(this, index));
  },
});

export const PreviousButton = ButtonComponent({
  async handle(index: number) {
    await this.update(await renderModlogs.call(this, index));
  },
});

// export const ModlogsSelectMenu = SelectMenuComponent({
//   handle(ctx: null) {},
// });
