import { colors, db, icons } from '$lib/db';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { allCommands } from '../../events/ready';
import { joinBuilderCache } from '../renderers';
import { MessageTypes, resolveMsgType } from '../types';

export const SaveButton = ButtonComponent({
  async handle(type: MessageTypes) {
    const data = joinBuilderCache.get(this.guildId);

    console.log(data);

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

    joinBuilderCache.delete(this.guildId);

    const command = allCommands.find(
      (c) => c.name === (type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell')
    );

    await this.update({
      content: invisibleChar,
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this.locale, 'JOINLEAVE_MESSAGE_SAVE_TITLE').replace(
              '<TYPE>',
              t(this.locale, type)
            ),
            iconURL: icons.success,
          })
          .setDescription(
            t(this.locale, `${type}_SAVE_DESCRIPTION`).replace(
              '<COMMAND>',
              `</${type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell'} message:${command.id}>`
            )
          )
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });
  },
});
