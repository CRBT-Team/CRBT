import { CRBTError } from '$lib/functions/CRBTError';
import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { EditableFeatures } from '$lib/types/settings';
import { CustomEmojiRegex, emojiMention } from '@purplet/utils';
import { ModalComponent } from 'purplet';
import emojiJSON from '../../../../../static/misc/emoji.json';
import { renderFeatureSettings } from '../settings';
import { getSettings, saveServerSettings } from '../_helpers';

export const EditCurrencyModal = ModalComponent({
  async handle(h: null) {
    const { economy } = await getSettings(this.guildId);
    let currencySymbol = this.fields.getTextInputValue('currencySymbol');

    if (currencySymbol) {
      const emojiObj = getEmojiObject(currencySymbol);
      const fromJSON = emojiJSON.find(
        ({ name }) =>
          name.toLowerCase().replaceAll(' ', '_') ===
          currencySymbol.toLowerCase().replaceAll(' ', '_').replaceAll(':', '')
      );
      const fromEmojis = (await this.guild.emojis.fetch()).find(
        (e) => e.name === currencySymbol.replaceAll(':', '')
      );
      if (emojiObj && emojiObj.name && emojiObj.animated === undefined) {
        currencySymbol = currencySymbol;
      } else if (fromJSON) {
        currencySymbol = fromJSON.char;
      } else if (currencySymbol.match(CustomEmojiRegex)) {
        currencySymbol = currencySymbol;
      } else if (fromEmojis) {
        currencySymbol = emojiMention(fromEmojis);
      } else {
        currencySymbol = null;
      }
    } else {
      currencySymbol = economy.currencyNameSingular;
    }

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
