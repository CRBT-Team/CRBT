import { CRBTError } from '$lib/functions/CRBTError';
import { MessageBuilderTypes } from '$lib/types/messageBuilder';
import { ModalComponent } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';

export const ImportJSONModal = ModalComponent({
  async handle(type: MessageBuilderTypes) {
    const input = this.fields.getTextInputValue('value');

    try {
      const parsed = JSON.parse(input);

      if (
        !parsed ||
        !('type' in parsed) ||
        !('content' in parsed || 'embed' in parsed) ||
        type !== parsed.type
      ) {
        return CRBTError(this, 'Invalid JSON');
      }

      const builder = MessageBuilder({
        data: {
          type,
          ...parsed,
        },
        interaction: this,
      });

      await this.update(builder);
    } catch (e) {
      return CRBTError(this, 'Invalid JSON');
    }
  },
});
