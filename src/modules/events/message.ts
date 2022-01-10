import { OnEvent } from 'purplet';
import * as allCommands from '../../../data/misc/allCommands.json';

OnEvent('messageCreate', async (msg) => {
  console.log(msg);
  // if message starts with either // or bot mention
  if (msg.content.startsWith('//') || msg.content.startsWith(msg.client.user.toString())) {
    const cmdName = msg.content.split(' ')[0].slice(2);
    const args = msg.content.split(' ').slice(1);
    const findCmd = allCommands[cmdName];

    if (findCmd) {
      msg.reply(allCommands[cmdName]);
    }
  }
});
