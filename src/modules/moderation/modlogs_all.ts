import { db, emojis } from '$lib/db';
import { t } from '$lib/language';
import { moderationStrikes } from '@prisma/client';
import { Interaction, MessageButton, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, row } from 'purplet';

const cache = new Map<string, moderationStrikes>();

export default ChatCommand({
  name: 'modlogs all',
  description: 'View the moderation history for all users and channels in this server.',
  async handle() {
    const data = await db.moderationStrikes.findMany({
      where: { serverId: this.guild.id },
      orderBy: { createdAt: 'desc' },
    });
    data.forEach((strike) => {
      cache.set(strike.id, strike);
    });

    await this.reply(await renderModlogs(0, this));
  },
});

async function renderModlogs(index: number, ctx: Interaction) {
  const data =
    Array.from(cache.values()) ??
    (await db.moderationStrikes.findMany({
      where: { serverId: ctx.guild.id },
    }));

  const page = data.slice(index * 10, (index + 1) * 10);
  const pages = Math.ceil(data.length / 10);

  const { PREVIOUS, NEXT } = t(ctx, 'genericButtons');

  return {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: t(ctx, 'MODERATION_LOGS_VIEW_TITLE').replace('<SERVER>', ctx.guild.name),
          iconURL: ctx.guild.iconURL(),
        })
        .setFields(
          page.map((strike) => {
            switch (strike.type) {
              case 'CLEAR': {
                return {
                  name: `${strike.type} - <#${strike.targetId}> - <t:${Math.floor(
                    strike.createdAt.getTime() / 1000
                  )}:R>`,
                  value: `\nBy <@${strike.moderatorId}>`,
                };
              }
              default: {
                return {
                  name: `${strike.type} - <t:${Math.floor(strike.createdAt.getTime() / 1000)}:R>`,
                  value: `${strike.reason ?? ''}\nBy <@${strike.moderatorId}>`,
                };
              }
            }
          })
        ),
    ],
    components: components(
      row(
        new PreviousButton(index - 1)
          .setLabel(PREVIOUS)
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('PRIMARY')
          .setDisabled(index === 0),
        new MessageButton()
          .setCustomId('current_page')
          .setLabel(`Page ${index + 1}/${pages}`)
          .setStyle('SECONDARY')
          .setDisabled(true),
        new NextButton(index + 1)
          .setLabel(NEXT)
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle('PRIMARY')
          .setDisabled(index === pages - 1)
      )
    ),
  };
}

export const NextButton = ButtonComponent({
  async handle(index: number) {
    await this.update(await renderModlogs(index, this));
  },
});

export const PreviousButton = ButtonComponent({
  async handle(index: number) {
    await this.update(await renderModlogs(index, this));
  },
});
