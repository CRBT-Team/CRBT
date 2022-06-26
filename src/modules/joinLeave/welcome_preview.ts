import { db } from '$lib/db';
import { t } from '$lib/language';
import { ChatCommand } from 'purplet';
import { RawServerJoin, renderJoinLeavePreview } from './shared';

export default ChatCommand({
  name: 'welcome preview',
  description: t('en-US', 'JOINLEAVE_PREVIEW_DESCRIPTION').replace(
    '<TYPE>',
    t('en-US', 'JOIN_MESSAGE').toLowerCase()
  ),
  async handle() {
    const data = (await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { joinChannel: true, joinMessage: true },
    })) as RawServerJoin;

    await renderJoinLeavePreview.call(this, 'LEAVE_MESSAGE', data);
  },
});
