import { CRBTError } from '$lib/functions/CRBTError';
import { parseEmojiString } from '$lib/functions/parseEmojiString';
import { EditableFeatures } from '$lib/types/settings';
import { ModalComponent } from 'purplet';
import { renderFeatureSettings } from '../../../src/modules/settings/serverSettings/settings';
import {
  getSettings,
  saveServerSettings,
} from '../../../src/modules/settings/serverSettings/_helpers';

export const EditCurrencyModal = ModalComponent({
  async handle(h: null) {
    const { economy } = await getSettings(this.guildId);
    const currencySymbol = await parseEmojiString(
      this.fields.getTextInputValue('currencySymbol') || economy.currency_symbol,
      await this.guild.emojis.fetch()
    );

    if (!currencySymbol) {
      return CRBTError(
        this,
        'The emoji used for the symbol is invalid! Please use a unicode emoji or an emoji in the server using its name or full ID.'
      );
    }

    const newEconomy = {
      currency_symbol: currencySymbol,
      currency_name_singular:
        this.fields.getTextInputValue('currencyNameSingular') ?? economy.currency_name_singular,
      currency_name_plural:
        this.fields.getTextInputValue('currencyNamePlural') ?? economy.currency_name_plural,
    };

    await saveServerSettings(this.guildId, {
      economy: newEconomy,
    });
    // await fetchWithCache(
    //   `${this.guildId}:settings`,
    //   () =>
    //     prisma.servers.upsert({
    //       where: { id: this.guildId },
    //       create: {
    //         id: this.guildId,
    //         economy: { create: newEconomy },
    //       },
    //       update: {
    //         economy: {
    //           upsert: { create: newEconomy, update: newEconomy },
    //         },
    //       },
    //       include: include,
    //     }),
    //   true
    // );

    this.update(await renderFeatureSettings.call(this, EditableFeatures.economy));
  },
});
