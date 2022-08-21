import { cache } from '$lib/cache';
import { colors, db, icons } from '$lib/db';
import { slashCmd } from '$lib/functions/commandMention';
import { t } from '$lib/language';
import { JoinLeaveData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { invisibleChar } from '$lib/util/invisibleChar';
import { MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { allCommands } from '../../events/ready';
import { resolveMsgType } from '../../joinLeave/types';

export const SaveButton = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = cache.get<JoinLeaveData>(`${type}_BUILDER:${this.guildId}`);

    await db.servers.upsert({
      where: { id: this.guildId },
      update: {
        [resolveMsgType[type]]: data,
      },
      create: {
        id: this.guildId,
        [resolveMsgType[type]]: data,
      },
    });

    const command = allCommands.find(
      (c) => c.name === (type === MessageBuilderTypes.joinMessage ? 'welcome' : 'farewell')
    );

    await this.update({
      content: invisibleChar,
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this.locale, 'JOINLEAVE_MESSAGE_SAVE_TITLE').replace(
              '<TYPE>',
              t(this.locale, data.type)
            ),
            iconURL: icons.success,
          })
          .setDescription(
            t(this.locale, `${data.type}_SAVE_DESCRIPTION`).replace(
              '<COMMAND>',
              slashCmd((type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell') + 'channel')
            )
          )
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });

    cache.del(`${type}_BUILDER:${this.guildId}`);
  },
});
