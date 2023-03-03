import { CRBTError } from '$lib/functions/CRBTError';
import { ModalComponent } from 'purplet';
import { ItemEditProps } from '.';
import { newItemCache } from './CreateItemPart1';
import { handleCreateItemPart3 } from './CreateItemPart3';

export const EditItemStockModal = ModalComponent({
  async handle({ mode }: ItemEditProps) {
    const stock = this.fields.getTextInputValue('stock')
      ? parseInt(this.fields.getTextInputValue('stock'))
      : null;

    if (stock !== null && isNaN(stock)) {
      return CRBTError(this, 'The stock must be a number, without decimals.');
    }

    if (stock < 1 || stock > Number.MAX_SAFE_INTEGER) {
      return CRBTError(
        this,
        `The stock cannot be set below 1 or be higher than ${Number.MAX_SAFE_INTEGER}.`
      );
    }

    if (mode === 'setup') {
      const newData = {
        ...newItemCache.get(this.message.id),
        stock: stock,
      };

      newItemCache.set(this.message.id, newData);

      return handleCreateItemPart3.call(this);
    }

    //TODO: handle edit
  },
});
