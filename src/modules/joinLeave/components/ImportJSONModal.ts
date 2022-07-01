import { CRBTError } from '$lib/functions/CRBTError';
import { ModalComponent } from 'purplet';
import { renderJoinLeaveBuilder } from '../renderers';
import { MessageTypes } from '../types';

export const ImportJSONModal = ModalComponent({
  async handle(type: MessageTypes) {
    const input = this.fields.getTextInputValue('value');

    try {
      console.log('input', input);
      const parsed = JSON.parse(input);

      if (!parsed || !('content' in parsed && 'embed' in parsed)) {
        return this.reply(CRBTError('Invalid JSON'));
      }

      await this.update(await renderJoinLeaveBuilder.call(this, type, parsed));
    } catch (e) {
      return this.reply(CRBTError('Invalid JSON'));
    }
  },
});
