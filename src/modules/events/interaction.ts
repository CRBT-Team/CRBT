import { cache } from '$lib/cache';
import { db, misc } from '$lib/db';
import { UnknownError } from '$lib/functions/CRBTError';
import { MessageContextMenuInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { handleRolePickerButton } from '../rolePickers/handleButton';
import { handleRolePickerSelectMenu } from '../rolePickers/handleSelectMenu';
// import { customCmds } from '../customCommands/commands';

enum RolePickerBehavior {
  TOGGLE,
  ONCE,
}

export default OnEvent('interactionCreate', async (i) => {
  if ((i.isButton() || i.isSelectMenu()) && i.customId.startsWith('PICKER')) {
    const data = {
      id: i.customId.split('_')[1],
      behavior: RolePickerBehavior[i.customId.split('_')[2]],
    };

    if (i.isButton()) return handleRolePickerButton.call(i, data);
    if (i.isSelectMenu()) return handleRolePickerSelectMenu.call(i);
  }

  if (!i.isCommand() && !i.isContextMenu()) return;

  if (!['859369676140314624', misc.CRBTid].includes(i.client.user.id)) return;

  const cmdName = [
    i.commandName,
    i.options.data.find((o) => o.type === 'SUB_COMMAND_GROUP')?.name,
    i.options.data.find((o) => o.type === 'SUB_COMMAND')?.name,
  ]
    .filter(Boolean)
    .join(' ');

  // if (i.isCommand() && customCmds.has(i.commandName)) {
  //   const cmd = customCmds.get(i.commandName);
  //   cmd.handle(i, i.options);
  // }

  try {
    console.log(cmdName);

    let value = cache.get(`tlm_${i.user.id}`);

    if (value === undefined) {
      const fromDB = await db.users.findFirst({
        where: { id: i.user.id },
        select: { telemetry: true },
      });

      cache.set(`tlm_${i.user.id}`, fromDB?.telemetry === undefined ? true : fromDB?.telemetry);
      value = fromDB?.telemetry === undefined ? true : fromDB?.telemetry;
    }

    if (value === false) return;
  } catch (e) {
    UnknownError(i, e);
  }
  if (i.isCommand()) {
    (i.client.channels.cache.get(misc.channels.telemetry) as TextChannel).send({
      embeds: [
        new MessageEmbed()
          .setDescription(`\`\`\`\n${i}\`\`\``)
          .addField('User ID', i.user.id)
          .addField('Platform', i.guild ? 'Guild' : 'DM'),
      ],
    });
  } else if (i.isContextMenu()) {
    (i.client.channels.cache.get(misc.channels.telemetry) as TextChannel).send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `\`\`\`\n${i.commandName} ${
              i.isUserContextMenu()
                ? `user:${i.targetUser.id}`
                : `message:${(i as MessageContextMenuInteraction).targetMessage.id}`
            }\`\`\``
          )
          .addField('User ID', i.user.id)
          .addField('Platform', i.guild ? 'Guild' : 'DM'),
      ],
    });
  }
});
