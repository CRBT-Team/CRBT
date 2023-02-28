import { CRBTError } from '$lib/functions/CRBTError';
import { parseEmojiString } from '$lib/functions/parseEmojiString';
import { EditableFeatures } from '$lib/types/settings';
import { ModalComponent } from 'purplet';
import { renderFeatureSettings } from '../settings';
import { getSettings, saveServerSettings } from '../_helpers';

export const EditCurrencyModal = ModalComponent({
  async handle(h: null) {
    const { economy } = await getSettings(this.guildId);
    const currencySymbol = await parseEmojiString(
      this.fields.getTextInputValue('currencySymbol') || economy.currencySymbol,
      await this.guild.emojis.fetch()
    );

    if (!currencySymbol) {
      return CRBTError(
        this,
        'The emoji used for the symbol is invalid! Please use a unicode emoji or an emoji in the server using its name or full ID.'
      );
    }

    const newEconomy = {
      currencySymbol,
      currencyNameSingular:
        this.fields.getTextInputValue('currencyNameSingular') ?? economy.currencyNameSingular,
      currencyNamePlural:
        this.fields.getTextInputValue('currencyNamePlural') ?? economy.currencyNamePlural,
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
