import { MessageAttachment } from 'discord.js';
import { MessageContextCommand } from 'purplet';

export default !process.argv.includes('--dev')
  ? null
  : MessageContextCommand({
      name: 'View JSON',
      async handle(message) {
        const output = message.toJSON();

        this.reply({
          files: [
            new MessageAttachment(
              Buffer.from(JSON.stringify(output, null, 2)),
              `message_${message.id}.json`
            ),
          ],
          ephemeral: true,
        });
      },
    });
