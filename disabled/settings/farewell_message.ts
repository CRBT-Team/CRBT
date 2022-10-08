import { t } from '$lib/language';
import { MessageBuilderTypes } from '$lib/types/messageBuilder';
import { ChatCommand } from 'purplet';
import { renderJoinLeavePrebuilder } from '../renderers';

export default ChatCommand({
  name: 'farewell message',
  description: t('en-US', 'LEAVE_MESSAGE_DESCRIPTION'),
  allowInDMs: false,
  handle() {
    renderJoinLeavePrebuilder.call(this, MessageBuilderTypes.leaveMessage);
  },
});
