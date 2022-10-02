import { cache } from '$lib/cache';
import { emojis } from '$lib/db';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { MessageBuilderData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageAttachment } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { BackButton } from '../../components/MessageBuilder/BackButton';

export const ExportJSONButton = ButtonComponent({
  async handle(type: MessageBuilderTypes) {
    const data = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)) {
      return CRBTError(this, t('en-US', 'ERROR_ADMIN_ONLY'));
    }

    if (!data) {
      return CRBTError(this, t(this, 'ERROR_NO_MESSAGE'));
    }

    const buffer = Buffer.from(JSON.stringify(data, null, 2));
    const { BACK } = t(this, 'genericButtons');

    return this.update({
      content: `JSON file generated! You can now reuse this welcome message elsewhere by clicking Import in ${slashCmd(
        (type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell') + 'message'
      )}.`,
      embeds: [],
      files: [new MessageAttachment(buffer).setName(`${type}.json`)],
      components: components(
        row(
          new BackButton(type as never)
            .setLabel(BACK)
            .setStyle('SECONDARY')
            .setEmoji(emojis.buttons.left_arrow)
        )
      ),
    });
  },
});
