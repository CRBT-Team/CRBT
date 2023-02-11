import { createCRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, User } from 'discord.js';
import { ChatCommand, OptionBuilder, UserContextCommand } from 'purplet';
import { renderModlogs } from './modlogs_all';

export default ChatCommand({
  name: 'modlogs user',
  description: "View a user's Moderation History.",
  allowInDMs: false,
  options: new OptionBuilder().user('user', 'Whose Moderation History to get.', {
    nameLocalizations: getAllLanguages('USER', localeLower),
  }),
  async handle({ user }) {
    await this.deferReply();
    user ??= this.user;

    const res = await viewModLogs.call(this, user);

    return await this.editReply(res);
  },
});

export const viewModLogsCtxCommand = UserContextCommand({
  name: 'Moderation History',
  async handle(user) {
    await this.deferReply({
      ephemeral: true,
    });

    const res = await viewModLogs.call(this, user);

    return await this.editReply(res);
  },
});

async function viewModLogs(
  this: CommandInteraction | ContextMenuInteraction | ButtonInteraction,
  user: User
) {
  if (
    user.id !== this.user.id &&
    !hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)
  ) {
    return createCRBTError(
      this,
      t(this, 'ERROR_MISSING_PERMISSIONS').replace('{PERMISSIONS}', 'Manage Server')
    );
  }

  return renderModlogs.call(this, 0, { userId: user.id });
}