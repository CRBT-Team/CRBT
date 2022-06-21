import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ChatCommand } from 'purplet';
import { RawServerLeave, renderJoinLeave } from './shared';

export default ChatCommand({
  name: 'farewell message',
  description: t('en-US', 'LEAVE_MESSAGE_DESCRIPTION'),
  async handle() {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
      return this.reply(CRBTError(t('en-US', 'ERROR_ADMIN_ONLY')));
    }

    const data = (await db.servers.findFirst({
      where: { id: this.guildId },
      select: { leaveMessage: true },
    })) as RawServerLeave;

    await this.reply(await renderJoinLeave('LEAVE_MESSAGE', data?.leaveMessage, this.locale));
  },
});
