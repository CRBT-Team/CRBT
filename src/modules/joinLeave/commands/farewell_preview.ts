import { db } from '$lib/db';
import { t } from '$lib/language';
import { ChatCommand } from 'purplet';
import { renderJoinLeavePreview } from '../renderers';
import { RawServerLeave } from '../types';

export default ChatCommand({
  name: 'farewell preview',
  description: t('en-US', 'JOINLEAVE_PREVIEW_DESCRIPTION').replace(
    '<TYPE>',
    t('en-US', 'LEAVE_MESSAGE').toLowerCase()
  ),
  async handle() {
    const data = (await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { leaveChannel: true, leaveMessage: true },
    })) as RawServerLeave;

    await renderJoinLeavePreview.call(this, 'LEAVE_MESSAGE', data);
  },
});
