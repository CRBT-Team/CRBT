import { t } from '$lib/language';
import { ChatCommand } from 'purplet';
import { MessageBuilderTypes } from '../../components/MessageBuilder/types';
import { renderJoinLeavePrebuilder } from '../renderers';

export default ChatCommand({
  name: 'welcome message',
  description: t('en-US', 'JOIN_MESSAGE_DESCRIPTION'),
  allowInDMs: false,
  handle() {
    renderJoinLeavePrebuilder.call(this, MessageBuilderTypes.joinMessage);
  },
});
