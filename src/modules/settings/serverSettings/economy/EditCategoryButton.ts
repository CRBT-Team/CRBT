import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { t } from '$lib/language';
import { CustomEmojiRegex } from '@purplet/utils';
import { ButtonComponent, row } from 'purplet';
import { getSettings } from '../_helpers';
import { EditCategoryModal } from './EditCategoryModal';

export const EditCategoryButton = ButtonComponent({
  async handle(categoryId: number) {
    const {
      economy: { categories },
    } = await getSettings(this.guildId);
    const category = categories.find(({ id }) => id === categoryId);

    await this.showModal(
      new EditCategoryModal(categoryId).setTitle(`Edit Category`).setComponents(
        row({
          type: 'TEXT_INPUT',
          customId: 'label',
          value: category.label,
          required: true,
          minLength: 2,
          maxLength: 30,
          label: 'Label',
          style: 'SHORT',
        }),
        row({
          type: 'TEXT_INPUT',
          customId: 'emoji',
          value: category.emoji.match(CustomEmojiRegex)
            ? `:${getEmojiObject(category.emoji).name}:`
            : category.emoji,
          required: true,
          minLength: 1,
          maxLength: 40,
          placeholder: "You may use an emoji's name, ID, or full ID.",
          label: t(this, 'EMOJI'),
          style: 'SHORT',
        })
      )
    );
  },
});
