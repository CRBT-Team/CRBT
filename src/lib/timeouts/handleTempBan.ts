// import { colors } from '$lib/env';
// import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
// import { TempBanData } from '$lib/types/timeouts';
// import { Client } from 'discord.js';

// export async function handleTempBan(tempban: TempBanData, client: Client) {
//   const { data } = tempban;
//   const guild = client.guilds.cache.get(data.guildId);
//   const user = client.users.cache.get(data.userId);
//   try {
//     await guild.members.unban(data.userId);

//     await user
//       .send({
//         embeds: [
//           {
//             ...createCRBTmsg({
//               type: 'moderation',
//               subject: `Unbanned from ${guild.name}`,
//               user,
//               guildName: guild.name,
//               message: data.reason,
//             }),
//             color: colors.success,
//           },
//         ],
//       })
//       .catch(() => {});
//   } catch (e) {
//     console.error(e);
//   }
//   return;
// }
