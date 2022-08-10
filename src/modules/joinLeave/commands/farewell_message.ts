import { t } from '$lib/language';
import { ChatCommand } from 'purplet';
import { MessageBuilderTypes } from '../../components/MessageBuilder/types';
import { renderJoinLeavePrebuilder } from '../renderers';

export default ChatCommand({
  name: 'farewell message',
  description: t('en-US', 'LEAVE_MESSAGE_DESCRIPTION'),
  allowInDMs: false,
  handle() {
    renderJoinLeavePrebuilder.call(this, MessageBuilderTypes.leaveMessage);
  },
});
