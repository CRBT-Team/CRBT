import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { t } from '$lib/language';
import { CustomEmojiRegex } from '@purplet/utils';
import { ButtonComponent, row } from 'purplet';
import { ItemEditProps } from '.';
import { getGuildSettings } from '../_helpers';
import { newItemCache } from './CreateItemPart1';
import { EditItemInfoModal } from './EditItemInfoModal';

export const EditItemInfoButton = ButtonComponent({
  async handle({ id, mode, cId }: ItemEditProps) {
    const {
      economy: { items },
    } = await getGuildSettings(this.guildId);
    const itemInfo =
      id && mode === 'edit' ? items.find((i) => i.id === id) : newItemCache.get(this.message.id);

    await this.showModal(
      new EditItemInfoModal({ id, mode, cId }).setTitle('Edit Item').setComponents(
        row({
          type: 'TEXT_INPUT',
          customId: 'name',
          value: itemInfo?.name ?? undefined,
          required: true,
          minLength: 2,
          maxLength: 50,
          label: 'Name',
          style: 'SHORT',
        }),
        row({
          type: 'TEXT_INPUT',
          customId: 'description',
          value: itemInfo?.description ?? undefined,
          required: true,
          minLength: 2,
          maxLength: 1000,
          label: t(this, 'DESCRIPTION'),
          style: 'PARAGRAPH',
        }),
        row({
          type: 'TEXT_INPUT',
          customId: 'icon',
          value: itemInfo?.emoji
            ? itemInfo.emoji.match(CustomEmojiRegex)
              ? `:${getEmojiObject(itemInfo.emoji).name}:`
              : itemInfo.emoji
            : undefined,
          required: true,
          minLength: 1,
          maxLength: 40,
          placeholder: "You may use an emoji's name, ID, or full ID.",
          label: t(this, 'EMOJI'),
          style: 'SHORT',
        }),
        row({
          type: 'TEXT_INPUT',
          customId: 'price',
          value: itemInfo?.price !== undefined ? itemInfo.price.toString() : '0',
          required: true,
          minLength: 1,
          maxLength: 16,
          placeholder: 'You may only use numbers.',
          label: 'Price',
          style: 'SHORT',
        }),
      ),
    );
  },
});
