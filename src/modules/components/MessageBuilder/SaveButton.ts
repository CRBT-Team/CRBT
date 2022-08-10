import { cache } from '$lib/cache';
import { colors, db, icons } from '$lib/db';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { GuildMember, GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { allCommands } from '../../events/ready';
import { resolveMsgType } from '../../joinLeave/types';
import { parseCRBTscriptInMessage } from './parseCRBTscriptInMessage';
import { MessageBuilderData, MessageBuilderTypes, RolePickerData } from './types';

export const SaveButton = ButtonComponent({
  async handle(type: MessageBuilderTypes) {
    let data = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    if (data.type !== MessageBuilderTypes.rolePicker) {
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
                `</${type === 'JOIN_MESSAGE' ? 'welcome' : 'farewell'} channel:${command.id}>`
              )
            )
            .setColor(`#${colors.success}`),
        ],
        components: [],
      });
    } else {
      // TODO: handle role pickers
      data = parseCRBTscriptInMessage<RolePickerData>(data, {
        channel: this.channel as GuildTextBasedChannel,
        member: this.member as GuildMember,
      });

      data.components[0].components.forEach((c) => {
        c.disabled = false;
      });

      this.channel.send({
        content: data.content,
        embeds: [data.embed],
        components: data.components,
      });
    }

    cache.del(`${type}_BUILDER:${this.guildId}`);
  },
});
