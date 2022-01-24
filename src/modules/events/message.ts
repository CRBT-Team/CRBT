// import { OnEvent } from 'purplet';
// import * as allCommands from '../../../data/misc/allCommands.json';

// export default OnEvent('messageCreate', async (msg) => {
//   // if message starts with either // or bot mention
//   if (msg.content.startsWith('//') || msg.content.startsWith(msg.client.user.toString())) {
//     const cmdName = msg.content.split(' ')[0].slice(2);
//     const args = msg.content.split(' ').slice(1);
//     const findCmd = allCommands[cmdName];

//     if (findCmd) {
//       if (findCmd.name.split(' - ')[0] === 'X') {
//         if (findCmd.name.split(' - ')[1] === 'music') {
//           msg.reply(
//             `Sorry, but music commands are removed from CRBT since last September. To learn more, visit our support server: <https://crbt.ga/discord>.`
//           );
//         } else {
//           msg.reply(
//             `Sorry, but this command doesn't exist yet, as we are remaking CRBT on Slash Commands! Try again later.`
//           );
//         }
//       }
//       msg.reply(
//         `This CRBT command now exists as a slash command! To continue, use \`${findCmd}\`.`
//       );
//     }
//   }
// });
