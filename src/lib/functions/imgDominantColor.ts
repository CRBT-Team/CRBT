import chroma from 'chroma-js';
import { extractColors } from 'extract-colors';
import { FinalColor } from 'extract-colors/lib/types/Color';
import getPixels from 'get-pixels';
import { fetch } from 'undici';

export async function imgDominantColor(imageUrl: string) {
  const buffer = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());
  let averageColor: FinalColor;

  await new Promise<void>((resolve) =>
    getPixels(buffer, 'image/png', async (err, pixels) => {
      if (!err) {
        const data = [...pixels.data];
        const width = Math.round(Math.sqrt(data.length / 4));
        const height = width;

        const extractedColors = await extractColors({ data, width, height });
        averageColor = extractedColors?.[0];

        resolve();
      }
    }),
  );

  return chroma(averageColor.hex);
}
