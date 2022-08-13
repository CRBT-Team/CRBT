import { t } from '$lib/language';
import { MessageBuilderTypes } from '$lib/types/messageBuilder';
import { ChatCommand } from 'purplet';
import { renderJoinLeavePrebuilder } from '../renderers';

export default ChatCommand({
  name: 'welcome message',
  description: t('en-US', 'JOIN_MESSAGE_DESCRIPTION'),
  allowInDMs: false,
  handle() {
    renderJoinLeavePrebuilder.call(this, MessageBuilderTypes.joinMessage);
  },
});
