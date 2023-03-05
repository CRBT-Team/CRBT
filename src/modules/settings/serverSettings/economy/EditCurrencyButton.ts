import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { CustomEmojiRegex } from '@purplet/utils';
import { ButtonComponent, row } from 'purplet';
import { getSettings } from '../_helpers';
import { EditCurrencyModal } from './EditCurrencyModal';

export const EditCurrencyButton = ButtonComponent({
  async handle() {
    const { economy } = await getSettings(this.guildId);

    await this.showModal(
      new EditCurrencyModal().setTitle('Edit Currency').setComponents(
        row({
          style: 'SHORT',
          label: 'Currency name (singular)',
          required: true,
          value: economy.currencyNameSingular,
          minLength: 2,
          maxLength: 30,
          type: 'TEXT_INPUT',
          customId: 'currencyNameSingular',
        }),
        row({
          style: 'SHORT',
          label: 'Currency name (plural)',
          required: true,
          value: economy.currencyNamePlural,
          minLength: 2,
          maxLength: 40,
          type: 'TEXT_INPUT',
          customId: 'currencyNamePlural',
        }),
        row({
          style: 'SHORT',
          label: 'Symbol',
          required: true,
          value: economy.currencySymbol.match(CustomEmojiRegex)
            ? `:${getEmojiObject(economy.currencySymbol).name}:`
            : economy.currencySymbol,
          minLength: 1,
          maxLength: 40,
          placeholder: "You may use an emoji's name, ID, or full ID.",
          type: 'TEXT_INPUT',
          customId: 'currencySymbol',
        })
      )
    );
  },
});
