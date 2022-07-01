import { db } from '$lib/db';
import { t } from '$lib/language';
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
    const data = (await db.servers.findFirst({
      where: { id: this.guild.id },
      select: { joinChannel: true, joinMessage: true },
    })) as RawServerJoin;

    await renderJoinLeavePreview.call(this, 'JOIN_MESSAGE', data);
  },
});
