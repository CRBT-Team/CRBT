import { CRBTError } from '$lib/functions/CRBTError';
import { parseEmojiString } from '$lib/functions/parseEmojiString';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { ModalComponent } from 'purplet';
import { getGuildSettings, saveServerSettings } from '../_helpers';
import { guildFeatureSettings } from '../settings';

export const EditCurrencyModal = ModalComponent({
  async handle(h: null) {
    const { economy } = await getGuildSettings(this.guildId);
    const currencySymbol = await parseEmojiString(
      this.fields.getTextInputValue('currencySymbol') || economy.currencySymbol,
      await this.guild.emojis.fetch(),
    );

    if (!currencySymbol) {
      return CRBTError(
        this,
        'The emoji used for the symbol is invalid! Please use a unicode emoji or an emoji in the server using its name or full ID.',
      );
    }

    const newEconomy = {
      currency_symbol: currencySymbol,
      currency_name_singular:
        this.fields.getTextInputValue('currencyNameSingular') ?? economy.currencyNameSingular,
      currency_name_plural:
        this.fields.getTextInputValue('currencyNamePlural') ?? economy.currencyNamePlural,
    };

    await saveServerSettings(this.guildId, {
      economy: {
        currencySymbol: newEconomy.currency_symbol,
        currencyNameSingular: newEconomy.currency_name_singular,
        currencyNamePlural: newEconomy.currency_name_plural,
      },
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

    this.update(await guildFeatureSettings.call(this, EditableGuildFeatures.economy));
  },
});
