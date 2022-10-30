import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { t } from '$lib/language';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ButtonComponent } from 'purplet';
import { resolveMsgType } from '../../joinLeave/types';

export const SaveButton = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = cache.get<JoinLeaveData>(`${type}_BUILDER:${this.guildId}`);

    await prisma.servers.upsert({
      where: { id: this.guildId },
      update: {
        [resolveMsgType[type]]: data,
      },
      create: {
        id: this.guildId,
        [resolveMsgType[type]]: data,
      },
    });

    await this.update({
      content: invisibleChar,
      embeds: [
        {
          title: `${emojis.success} ${t(this.locale, 'JOINLEAVE_MESSAGE_SAVE_TITLE').replace(
            '<TYPE>',
            t(this.locale, data.type)
          )}`,
          description: t(this.locale, `${data.type}_SAVE_DESCRIPTION`).replace(
            '<COMMAND>',
            slashCmd((type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell') + ' channel')
          ),
          color: colors.success,
        },
      ],
      components: [],
    });

    cache.del(`${type}_BUILDER:${this.guildId}`);
  },
});
