import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ocrSpace } from 'ocr-space-api-wrapper';
import { MessageContextCommand } from 'purplet';

export default MessageContextCommand({
  name: 'Find Text in Image',
  async handle(message) {
    if (
      !message.attachments.size ??
      !message.embeds.some((embed) => embed.image && embed.image.url)
    ) {
      return this.reply(CRBTError("This message doesn't have any images!"));
    }

    await this.deferReply({ ephemeral: true });

    const image = message.attachments.size
      ? message.attachments.first().url
      : message.embeds.filter((e) => e.image)[0].image.url;

    const req = await ocrSpace(image, {
      apiKey: process.env.OCR_TOKEN,
    });

    if (
      !req ||
      !req.ParsedResults ||
      req.IsErroredOnProcessing ||
      req.ParsedResults?.ErrorMessage
    ) {
      await this.editReply(
        CRBTError(
          'No text was recognized off this image. Please try again with a different image, and make sure that the text is legible.'
        )
      );
    }

    await this.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'Text found in image' })
          .setDescription(`\`\`\`\n${req.ParsedResults[0].ParsedText}\`\`\``)
          .setFooter({
            text: `Powered by ocr.space • Processed in ${req.ProcessingTimeInMilliseconds}ms`,
          })
          .setColor(await getColor(this.user)),
      ],
    });
  },
});
