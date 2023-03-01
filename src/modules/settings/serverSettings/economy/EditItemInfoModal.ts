import { CRBTError } from '$lib/functions/CRBTError';
import { parseEmojiString } from '$lib/functions/parseEmojiString';
import { ModalComponent } from 'purplet';
import { ItemEditProps } from '.';
import { handleCreateItemPart1, newItemCache } from './CreateItemPart1';

export const EditItemInfoModal = ModalComponent({
  async handle({ id, mode, cId }: ItemEditProps) {
    const icon = await parseEmojiString(
      this.fields.getTextInputValue('icon'),
      await this.guild.emojis.fetch()
    );
    const price = parseInt(this.fields.getTextInputValue('price'));
    if (isNaN(price)) {
      return CRBTError(this, 'The price can only be a valid number without decimals.');
    }

    if (mode === 'setup') {
      newItemCache.set(this.message.id, {
        name: this.fields.getTextInputValue('name'),
        description: this.fields.getTextInputValue('description'),
        icon,
        price,
        categoryId: cId,
      });

      return await handleCreateItemPart1.call(this, cId);
    }
    // TODO: add for regular editing
  },
});
