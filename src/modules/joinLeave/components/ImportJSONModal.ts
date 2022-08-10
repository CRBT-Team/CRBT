import { CRBTError } from '$lib/functions/CRBTError';
import { ModalComponent } from 'purplet';
import { MessageBuilder, MessageBuilderTypes } from '../../components/MessageBuilder';

export const ImportJSONModal = ModalComponent({
  async handle(type: MessageBuilderTypes) {
    const input = this.fields.getTextInputValue('value');

    try {
      console.log('input', input);
      const parsed = JSON.parse(input);

      if (!parsed || !('content' in parsed && 'embed' in parsed)) {
        return this.reply(CRBTError('Invalid JSON'));
      }

      const builder = MessageBuilder({
        type,
        message: parsed,
        interaction: this,
      });

      await this.update(builder);
    } catch (e) {
      return this.reply(CRBTError('Invalid JSON'));
    }
  },
});
