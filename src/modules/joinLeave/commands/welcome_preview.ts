import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ChatCommand } from 'purplet';
import { renderJoinLeavePreview } from '../renderers';
import { RawServerJoin } from '../types';

export default ChatCommand({
  name: 'welcome preview',
  description: t('en-US', 'JOINLEAVE_PREVIEW_DESCRIPTION').replace(
    '<TYPE>',
    t('en-US', 'JOIN_MESSAGE').toLowerCase()
  ),
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator, true)) {
      return CRBTError(this, t(this, 'ERROR_ADMIN_ONLY'));
    }

    const data = (await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { joinChannel: true, joinMessage: true },
    })) as RawServerJoin;

    await renderJoinLeavePreview.call(this, 'JOIN_MESSAGE', data);
  },
});
