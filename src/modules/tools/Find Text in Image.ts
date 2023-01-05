import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { MessageEmbed } from 'discord.js';
import { ocrSpace } from 'ocr-space-api-wrapper';
import { MessageContextCommand } from 'purplet';

// export default
MessageContextCommand({
  name: 'Find Text in Image',
  async handle(message) {
    const image = message.attachments.size
      ? message.attachments.first().url
      : message.embeds.find((e) => e.image)?.image?.url ??
        message.embeds.find((e) => e.thumbnail)?.thumbnail?.url;

    if (!image) {
      return CRBTError(this, { title: "This message doesn't have any images!" });
    }

    await this.deferReply({ ephemeral: true });

    try {
      const start = Date.now();
      const [text, error] = await useOcrScan(image);

      if (error) {
        await CRBTError(this, {
          title: 'No text was recognized from this image.',
          description:
            'Please try again with a different image, and make sure that the text is legible.',
        });
        return;
      }

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: 'Text found in image' })
            .setDescription(`\`\`\`\n${text}\`\`\``)
            .setFooter({
              text: `${t(this, 'POWERED_BY', {
                provider: 'ocr.space',
              })} • Processed in ${Date.now() - start}ms`,
            })
            .setColor(await getColor(this.user)),
        ],
      });
    } catch (e) {
      CRBTError(this, {
        title: 'No text was recognized from this image.',
        description:
          'Please try again with a different image, and make sure that the text is legible.',
      });
      return;
    }
  },
});

export async function useOcrScan(
  imageUrl: string,
  lang: string = 'eng'
): Promise<[string, boolean]> {
  const req = await ocrSpace(imageUrl, {
    apiKey: process.env.OCR_TOKEN,
    OCREngine: '3',
  });

  let error = false;

  if (
    !req ||
    !req.ParsedResults ||
    req.IsErroredOnProcessing ||
    !req.ParsedResults.length ||
    !req.ParsedResults[0].ParsedText ||
    req.ParsedResults?.ErrorMessage
  ) {
    error = true;
  }

  return [req.ParsedResults[0].ParsedText, error];
}
