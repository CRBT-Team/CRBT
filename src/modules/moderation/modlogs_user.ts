import { prisma } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { CommandInteraction, ContextMenuInteraction, MessageEmbed, User } from 'discord.js';
import { ChatCommand, OptionBuilder, UserContextCommand } from 'purplet';

export default ChatCommand({
  name: 'modlogs user',
  description: 'View the moderation history for a chosen user, or yours.',
  allowInDMs: false,
  options: new OptionBuilder().user('user', 'The user to view the history of.'),
  handle: viewModLogs,
});

export const viewModLogsCtxCommand = UserContextCommand({
  name: 'View Moderation History',
  handle(user) {
    return viewModLogs.call(this, { user });
  },
});

async function viewModLogs(
  this: CommandInteraction | ContextMenuInteraction,
  opts: {
    user?: User;
  }
) {
  const user = opts.user || this.user;

  if (
    user !== this.user &&
    !hasPerms(this.memberPermissions, PermissionFlagsBits.ModerateMembers)
  ) {
    return CRBTError(this, t(this, 'ERROR_MISSING_PERMISSIONS').replace('<PERMISSIONS>', 'Moderate Members'));
  }

  const data = await prisma.moderationStrikes.findMany({
    where: { targetId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const embed = new MessageEmbed()
    .setAuthor({
      name: `${user.username}#${user.discriminator} - Moderation history in ${this.guild.name}`,
      iconURL: avatar(user),
    })
    .setDescription(!data || data.length === 0 ? '*No moderation history found.*' : '')
    .setFields(
      data.map((strike) => {
        return {
          name: `${strike.type} - <t:${Math.floor(strike.createdAt.getTime() / 1000)}:R>`,
          value: `${strike.reason}\nBy <@${strike.moderatorId}>`,
        };
      })
    )
    .setColor(await getColor(this.user));

  await this.reply({ embeds: [embed], ephemeral: this instanceof ContextMenuInteraction });
}
