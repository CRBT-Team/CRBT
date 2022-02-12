import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { MessageContextCommand } from 'purplet';

export default MessageContextCommand({
  name: 'Scan QR Code',
  async handle(message) {
    if (
      !message.attachments.size ??
      !message.embeds.some((embed) => embed.image && embed.image.url)
    ) {
      return this.reply(CRBTError(null, "This message doesn't have any images!"));
    }
    await this.deferReply({ ephemeral: true });

    const req = await fetch(
      `https://api.qrserver.com/v1/read-qr-code/?fileurl=${
        message.attachments.size
          ? message.attachments.first().url
          : message.embeds.filter((e) => e.image)[0].image.url
      }`
    );

    if (req.ok) {
      const data: any = await req.json();
      if (data[0].symbol[0].data) {
        await this.editReply({
          embeds: [
            new MessageEmbed()
              .setAuthor({ name: 'QR Code scanned!' })
              .addField('Parsed text or URL', data[0].symbol[0].data)
              .setColor(await getColor(this.user)),
          ],
        });
      } else {
        await this.editReply(CRBTError(null, "This message doesn't have any QR codes!"));
      }
    } else {
      await this.editReply(CRBTError(null, "This message doesn't have any QR codes!"));
    }
  },
});
