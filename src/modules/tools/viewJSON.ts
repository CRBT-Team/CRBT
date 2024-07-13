import { MessageAttachment } from 'discord.js';
import { MessageContextCommand } from 'purplet';

export default MessageContextCommand({
  name: 'Get JSON',
  async handle(message) {
    await this.deferReply({
      ephemeral: true,
    });

    const req = await fetch(`https://discord.com/api/v10/channels/${message.channel.id}/messages/${message.id}`, {
      headers: {
        Authorization: `Bot ${this.client.token}`,
      },
    });

    const json = await req.json();

    if (req.ok) {
      await this.editReply({
        files: [
          new MessageAttachment(
            Buffer.from(JSON.stringify(json, null, 2)),
            `message_${message.id}.json`
          ),
        ],
      });
    }
  },
});
