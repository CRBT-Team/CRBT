import { CRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { UserContextCommand } from 'purplet';
import { renderModlogs } from './moderation_history';

export const UserModerationHistory = UserContextCommand({
  name: 'Moderation History',
  async handle(user) {
    await this.deferReply({
      ephemeral: true,
    });

    if (
      user.id !== this.user.id &&
      !hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)
    ) {
      return CRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS', {
          PERMISSIONS: 'Manage Server',
        }),
      );
    }

    const res = await renderModlogs.call(this, 0, { targetId: user.id });

    await this.editReply(res);
  },
});
