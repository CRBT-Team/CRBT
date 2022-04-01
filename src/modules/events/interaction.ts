import { colors, illustrations, misc } from '$lib/db';
import { MessageButton, MessageEmbed } from 'discord.js';
import { components, OnEvent, row } from 'purplet';

export default OnEvent('interactionCreate', async (i) => {
  if (!i.isCommand() && !i.isContextMenu()) return;

  if (!['859369676140314624', misc.CRBTid].includes(i.client.user.id)) return;

  if (['pong', 'balance', 'hourly', 'leaderboard', 'profile'].includes(i.commandName)) return;

  return i
    .reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'No CRBT Premium subscription detected.',
            iconURL: illustrations.error,
          })
          .setDescription(
            'In order to use this feature, you must have a CRBT Premium subscription.\nCRBT Premium includes all of the features you love from CRBT, like:\n- `/ping`\n- CRBT Profiles\n- Economy\n- Crickets\n- And more!\nIf you had any Purplets, chances are they got removed from your account!\nClick the button below in order to learn more about CRBT Premium for only $99 USD per user per server per month!'
          )
          .setColor(`#${colors.red}`),
      ],
      components: components(
        row(
          new MessageButton()
            .setLabel('Learn more about CRBT Premium')
            .setStyle('LINK')
            .setURL('https://www.youtube.com/watch?v=6n3pFFPSlW4')
        )
      ),
    })
    .catch((e) => {});

  // try {
  //   let value = cache.get(`tlm_${i.user.id}`);
  //   const fromDB = await db.users.findFirst({
  //     where: { id: i.user.id },
  //     select: { telemetry: true },
  //   });

  //   if (value === undefined) {
  //     cache.set(`tlm_${i.user.id}`, fromDB?.telemetry === undefined ? true : fromDB?.telemetry);
  //     value = fromDB?.telemetry === undefined ? true : fromDB?.telemetry;
  //   }

  //   if (value === false) return;
  // } catch (e) {
  //   UnknownError(i, String(e));
  // }
  // if (i.isCommand()) {
  //   (i.client.channels.cache.get(misc.channels.telemetry) as TextChannel).send({
  //     embeds: [
  //       new MessageEmbed().setDescription(`\`\`\`\n${i}\`\`\``).addField('User ID', i.user.id),
  //     ],
  //   });
  // } else if (i.isContextMenu()) {
  //   (i.client.channels.cache.get(misc.channels.telemetry) as TextChannel).send({
  //     embeds: [
  //       new MessageEmbed()
  //         .setDescription(
  //           `\`\`\`\n${i.commandName} ${
  //             i.isUserContextMenu()
  //               ? `user:${i.targetUser.id}`
  //               : `message:${(i as MessageContextMenuInteraction).targetMessage.id}`
  //           }\`\`\``
  //         )
  //         .addField('User ID', i.user.id)
  //         .addField('Platform', i.channel.type),
  //     ],
  //   });
  // }
});
