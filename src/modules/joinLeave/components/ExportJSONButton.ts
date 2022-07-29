import { emojis } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageAttachment } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { allCommands } from '../../events/ready';
import { joinBuilderCache } from '../renderers';
import { MessageTypes, resolveMsgType } from '../types';
import { BackButton } from './BackButton';

export const ExportJSONButton = ButtonComponent({
  async handle(type: MessageTypes) {
    const data = joinBuilderCache.get(this.guildId);

    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)) {
      return this.reply(CRBTError(t('en-US', 'ERROR_ADMIN_ONLY')));
    }

    if (!data) {
      return this.reply(
        CRBTError(
          t(
            this,
            type === 'JOIN_MESSAGE'
              ? 'JOIN_PREVIEW_ERROR_NO_MESSAGE'
              : 'LEAVE_PREVIEW_ERROR_NO_MESSAGE'
          ).replace('<TYPE>', t(this, type))
        )
      );
    }

    const buffer = Buffer.from(JSON.stringify(data, null, 2));
    const { BACK } = t(this, 'genericButtons');

    const messageCommand = allCommands.find(
      ({ name }) => name === (type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell')
    );

    return this.update({
      content: `JSON file generated! You can now reuse this welcome message elsewhere by clicking Import in </${
        type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell'
      } message:${messageCommand.id}>.`,
      embeds: [],
      files: [new MessageAttachment(buffer).setName(`${resolveMsgType[type]}.json`)],
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
