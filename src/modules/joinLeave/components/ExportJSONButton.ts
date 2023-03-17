import { cache } from '$lib/cache';
import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { MessageBuilderData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { MessageAttachment } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { BackButton } from '../../components/MessageBuilder/BackButton';

export const ExportJSONButton = ButtonComponent({
  async handle(type: MessageBuilderTypes) {
    const data = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    if (!data) {
      return CRBTError(this, t(this, 'ERROR_NO_MESSAGE'));
    }

    const buffer = Buffer.from(JSON.stringify(data, null, 2));

    return this.update({
      content: `JSON file generated! You can now reuse this message elsewhere by clicking the Import button when setting it up.`,
      embeds: [],
      files: [new MessageAttachment(buffer).setName(`${type}.json`)],
      components: components(
        row(
          new BackButton(type as never)
            .setLabel(t(this, 'BACK'))
            .setStyle('SECONDARY')
            .setEmoji(emojis.buttons.left_arrow)
        )
      ),
    });
  },
});
